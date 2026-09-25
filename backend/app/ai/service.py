from pathlib import Path

from sqlalchemy.orm import Session

from app.ai import prompts, provider, stub
from app.ai.provider import ProviderError
from app.config import settings
from app.models import AppSettings, Conversation, Lab, Quiz, StudyNote

CHAT_HISTORY_LIMIT = 20


def get_active_provider(db: Session) -> str:
    row = db.get(AppSettings, 1)
    return row.ai_provider if row else settings.default_ai_provider


def set_active_provider(db: Session, provider_name: str) -> str:
    row = db.get(AppSettings, 1)
    if row is None:
        row = AppSettings(id=1, ai_provider=provider_name)
        db.add(row)
    else:
        row.ai_provider = provider_name
    db.commit()
    return row.ai_provider


def _read_readme(lab: Lab) -> str | None:
    if not lab.readme_path:
        return None
    path = Path(lab.readme_path)
    if not path.is_file():
        return None
    return path.read_text(encoding="utf-8", errors="ignore")


def generate_explanation(db: Session, lab: Lab, mode: str) -> dict:
    active = get_active_provider(db)
    if not provider.is_configured(active):
        return stub.stub_explanation(lab)

    system_prompt, messages = prompts.build_explain_prompt(lab, _read_readme(lab), mode)
    try:
        data = provider.complete_json(active, system_prompt, messages)
    except ProviderError:
        data = stub.stub_explanation(lab)
        return data

    required = ("what_is_it", "why_it_happens", "attacker_impact", "what_to_learn", "detection", "mitigation")
    if not all(key in data for key in required):
        return stub.stub_explanation(lab)

    data["stubbed"] = False
    return data


def get_chat_history(db: Session, lab_id: int) -> list[Conversation]:
    return (
        db.query(Conversation)
        .filter(Conversation.lab_id == lab_id)
        .order_by(Conversation.created_at)
        .all()
    )


def send_chat_message(db: Session, lab: Lab, message: str, mode: str) -> Conversation:
    user_row = Conversation(lab_id=lab.id, role="user", message=message, mode=mode)
    db.add(user_row)
    db.commit()

    active = get_active_provider(db)
    if not provider.is_configured(active):
        reply = stub.stub_chat_reply(lab, message)
    else:
        recent = get_chat_history(db, lab.id)[-(CHAT_HISTORY_LIMIT + 1) : -1]
        history = [(row.role, row.message) for row in recent]
        system_prompt, messages = prompts.build_chat_messages(
            lab, _read_readme(lab), mode, history, message
        )
        try:
            reply = provider.complete(active, system_prompt, messages)
        except ProviderError as exc:
            reply = f"AI request failed: {exc}"

    assistant_row = Conversation(lab_id=lab.id, role="assistant", message=reply, mode=mode)
    db.add(assistant_row)
    db.commit()
    db.refresh(assistant_row)
    return assistant_row


def explain_command(db: Session, lab: Lab, command: str) -> str:
    active = get_active_provider(db)
    if not provider.is_configured(active):
        return stub.stub_explain_command(command)

    system_prompt, messages = prompts.build_explain_command_prompt(lab, command)
    try:
        return provider.complete(active, system_prompt, messages)
    except ProviderError as exc:
        return f"AI request failed: {exc}"


def generate_quiz(db: Session, lab: Lab) -> Quiz:
    active = get_active_provider(db)
    questions: list[dict] | None = None

    if provider.is_configured(active):
        system_prompt, messages = prompts.build_quiz_prompt(lab, _read_readme(lab))
        try:
            data = provider.complete_json(active, system_prompt, messages)
            candidate = data.get("questions")
            if isinstance(candidate, list) and len(candidate) > 0:
                questions = candidate
        except ProviderError:
            questions = None

    if questions is None:
        questions = stub.stub_quiz_questions(lab)

    row = Quiz(lab_id=lab.id, questions=questions)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def _grade_short_answers(db: Session, items: list[tuple[int, str, str, str]]) -> dict[int, bool]:
    """Semantically grade free-text answers via the AI.

    items: [(index, question, expected, given), ...].
    Falls back to marking incorrect if no provider is configured or the call
    fails — i.e. it never awards credit it couldn't actually verify.
    """
    active = get_active_provider(db)
    graded: dict[int, bool] = {idx: False for idx, *_ in items}
    if not provider.is_configured(active):
        return graded

    system_prompt, messages = prompts.build_grade_prompt(
        [{"index": idx, "question": q, "expected": exp, "given": giv} for idx, q, exp, giv in items]
    )
    try:
        data = provider.complete_json(active, system_prompt, messages)
    except ProviderError:
        return graded

    for result in data.get("results", []):
        try:
            idx = int(result["index"])
        except (KeyError, ValueError, TypeError):
            continue
        if idx in graded:
            graded[idx] = bool(result.get("is_correct"))
    return graded


def submit_quiz(db: Session, quiz: Quiz, answers: list[str]) -> Quiz:
    from datetime import datetime, timezone

    questions = quiz.questions
    total = len(questions)
    results: list[bool] = [False] * total
    to_grade: list[tuple[int, str, str, str]] = []

    for i, question in enumerate(questions):
        given = (answers[i] if i < len(answers) else "").strip()
        expected = str(question.get("correct_answer", "")).strip()
        if not given:
            continue
        # Exact (case-insensitive) match is always accepted and needs no AI call.
        if given.lower() == expected.lower():
            results[i] = True
        elif question.get("type") == "short_answer":
            # Differently-worded free text — defer to semantic grading.
            to_grade.append((i, str(question.get("question", "")), expected, given))
        # multiple_choice / true_false with a non-matching option stays incorrect.

    if to_grade:
        for idx, is_correct in _grade_short_answers(db, to_grade).items():
            results[idx] = is_correct

    correct = sum(1 for r in results if r)

    # Persist per-question correctness so the client renders the authoritative
    # result instead of re-grading with its own exact-match check.
    quiz.questions = [{**q, "is_correct": results[i]} for i, q in enumerate(questions)]
    quiz.answers = answers
    quiz.score = round((correct / total) * 100) if total else 0
    quiz.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(quiz)
    return quiz


def generate_study_notes(db: Session, lab: Lab) -> StudyNote:
    active = get_active_provider(db)
    if provider.is_configured(active):
        system_prompt, messages = prompts.build_study_notes_prompt(lab, _read_readme(lab))
        try:
            content = provider.complete(active, system_prompt, messages)
        except ProviderError:
            content = stub.stub_study_notes(lab)
    else:
        content = stub.stub_study_notes(lab)

    row = StudyNote(lab_id=lab.id, content=content)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
