from app.models import Lab

TUTOR_SYSTEM_PROMPT = """You are an AI cybersecurity tutor.

You are helping a student learn using an authorized
Vulhub cybersecurity training environment.

Your goal is to teach concepts rather than simply
provide commands.

Use the provided Vulhub documentation as the primary
source of truth.

Clearly distinguish documented information from
inference.

Explain unfamiliar terminology.

When appropriate, teach both offensive concepts and
defensive detection.

Do not assume facts that are not present in the
provided lab information."""

MODE_INSTRUCTIONS = {
    "beginner": (
        "Explain in beginner mode: simple language, minimal jargon, define any "
        "technical term the first time you use it."
    ),
    "technical": (
        "Explain in technical mode: assume the student knows security fundamentals; "
        "go deeper into the root cause and technical mechanics."
    ),
    "hint": (
        "Give a hint only. Guide the student toward the answer with a leading "
        "question or a partial clue. Do not reveal the full solution."
    ),
}

README_MAX_CHARS = 6000


def build_lab_context(lab: Lab, readme_text: str | None) -> str:
    readme = (readme_text or "(no README found for this lab)")[:README_MAX_CHARS]
    return (
        "LAB\n"
        f"CVE:\n{lab.cve or 'N/A'}\n\n"
        f"Product:\n{lab.product}\n\n"
        f"Lab folder name:\n{lab.name}\n\n"
        f"Inferred category (heuristic keyword match, may be inaccurate):\n"
        f"{lab.category or 'Unknown'}\n\n"
        f"README:\n{readme}"
    )


EXPLAIN_JSON_INSTRUCTIONS = """Respond with a single JSON object with exactly these string keys:
- "what_is_it": beginner-friendly explanation of what the vulnerability is
- "why_it_happens": the technical root cause
- "attacker_impact": what an attacker could do with it
- "what_to_learn": a short bullet list (use \\n between bullets) of learning objectives
- "detection": how a defender could detect exploitation attempts or evidence
- "mitigation": how the vulnerability is fixed or mitigated

Each value should be a few sentences (or a short bullet list for what_to_learn)."""


def build_explain_prompt(lab: Lab, readme_text: str | None, mode: str) -> tuple[str, list[dict]]:
    instruction = MODE_INSTRUCTIONS.get(mode, MODE_INSTRUCTIONS["beginner"])
    user_content = (
        f"{build_lab_context(lab, readme_text)}\n\n{instruction}\n\n{EXPLAIN_JSON_INSTRUCTIONS}"
    )
    return TUTOR_SYSTEM_PROMPT, [{"role": "user", "content": user_content}]


def build_chat_messages(
    lab: Lab,
    readme_text: str | None,
    mode: str,
    history: list[tuple[str, str]],
    question: str,
) -> tuple[str, list[dict]]:
    instruction = MODE_INSTRUCTIONS.get(mode, MODE_INSTRUCTIONS["beginner"])
    context_message = (
        f"{build_lab_context(lab, readme_text)}\n\n"
        f"{instruction}\n\n"
        "The student may ask follow-up questions about this lab. Keep answers "
        "focused on this lab's context unless asked otherwise."
    )
    messages = [{"role": "user", "content": context_message}]
    messages.append(
        {"role": "assistant", "content": "Understood — I have the lab context and I'm ready for questions."}
    )
    for role, message in history:
        messages.append({"role": role, "content": message})
    messages.append({"role": "user", "content": question})
    return TUTOR_SYSTEM_PROMPT, messages


def build_explain_command_prompt(lab: Lab, command: str) -> tuple[str, list[dict]]:
    user_content = (
        f"In the context of the '{lab.product}' Vulhub lab, explain what this "
        f"command does, breaking it down piece by piece:\n\n{command}"
    )
    return TUTOR_SYSTEM_PROMPT, [{"role": "user", "content": user_content}]


QUIZ_JSON_INSTRUCTIONS = """Generate exactly 5 quiz questions about this vulnerability: 2 beginner, 2 intermediate,
1 advanced. Mix question types (multiple_choice, true_false, short_answer) where it makes sense.

Respond with a single JSON object: {"questions": [...]}. Each question object has exactly these keys:
- "question": the question text
- "type": one of "multiple_choice", "true_false", "short_answer"
- "options": for multiple_choice, a list of 4 option strings; for true_false, ["True", "False"]; for
  short_answer, null
- "correct_answer": the correct answer as plain text, exactly matching one of the options when applicable
- "explanation": a short explanation of why that answer is correct"""


def build_quiz_prompt(lab: Lab, readme_text: str | None) -> tuple[str, list[dict]]:
    user_content = f"{build_lab_context(lab, readme_text)}\n\n{QUIZ_JSON_INSTRUCTIONS}"
    return TUTOR_SYSTEM_PROMPT, [{"role": "user", "content": user_content}]


STUDY_NOTES_INSTRUCTIONS = """Generate concise study notes for this lab as plain text (not JSON), formatted
similar to this example:

CVE-XXXX-XXXXX

Product:
<product>

Category:
<category>

Root Cause:
<one or two sentences>

Potential Impact:
<one or two sentences>

Detection:
<one or two sentences>

Mitigation:
<one or two sentences>

What I Learned:
• <bullet>
• <bullet>
• <bullet>"""


def build_study_notes_prompt(lab: Lab, readme_text: str | None) -> tuple[str, list[dict]]:
    user_content = f"{build_lab_context(lab, readme_text)}\n\n{STUDY_NOTES_INSTRUCTIONS}"
    return TUTOR_SYSTEM_PROMPT, [{"role": "user", "content": user_content}]


GRADE_SYSTEM_PROMPT = """You are grading short-answer responses on a cybersecurity quiz.

For each item you are given the question, a reference correct answer, and the
student's answer. Mark the student's answer correct when it conveys the same
core idea as the reference answer — accept different wording, synonyms,
paraphrasing, extra correct detail, or partial phrasing that still captures the
key concept. Mark it incorrect only when it is factually wrong, misses the key
concept, is empty, or contradicts the reference.

Judge meaning, not exact wording. Respond with JSON only, no prose."""


GRADE_JSON_INSTRUCTIONS = """Respond with a single JSON object:
{"results": [{"index": <int>, "is_correct": <true|false>}, ...]}
Include exactly one entry for every item, reusing the same "index" values given."""


def build_grade_prompt(items: list[dict]) -> tuple[str, list[dict]]:
    """items: [{"index": int, "question": str, "expected": str, "given": str}, ...]"""
    blocks = []
    for it in items:
        blocks.append(
            f'Item index {it["index"]}:\n'
            f'Question: {it["question"]}\n'
            f'Reference answer: {it["expected"]}\n'
            f'Student answer: {it["given"]}'
        )
    user_content = "\n\n".join(blocks) + "\n\n" + GRADE_JSON_INSTRUCTIONS
    return GRADE_SYSTEM_PROMPT, [{"role": "user", "content": user_content}]
