from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai import service
from app.database import get_db
from app.models import Lab, Quiz, StudyNote
from app.schemas import (
    AiExplanationOut,
    ChatMessageOut,
    ChatRequest,
    ExplainCommandOut,
    ExplainCommandRequest,
    ExplainRequest,
    QuizOut,
    QuizRequest,
    QuizSubmitRequest,
    StudyNoteOut,
    StudyNotesRequest,
)

router = APIRouter(prefix="/ai", tags=["ai"])


def _get_lab_or_404(lab_id: int, db: Session) -> Lab:
    lab = db.get(Lab, lab_id)
    if lab is None:
        raise HTTPException(status_code=404, detail="Lab not found")
    return lab


@router.post("/explain", response_model=AiExplanationOut)
def explain(body: ExplainRequest, db: Session = Depends(get_db)):
    lab = _get_lab_or_404(body.lab_id, db)
    return service.generate_explanation(db, lab, body.mode)


@router.get("/chat/{lab_id}", response_model=list[ChatMessageOut])
def get_chat_history(lab_id: int, db: Session = Depends(get_db)):
    _get_lab_or_404(lab_id, db)
    return service.get_chat_history(db, lab_id)


@router.post("/chat", response_model=ChatMessageOut)
def send_chat(body: ChatRequest, db: Session = Depends(get_db)):
    lab = _get_lab_or_404(body.lab_id, db)
    return service.send_chat_message(db, lab, body.message, body.mode)


@router.post("/explain-command", response_model=ExplainCommandOut)
def explain_command(body: ExplainCommandRequest, db: Session = Depends(get_db)):
    lab = _get_lab_or_404(body.lab_id, db)
    return ExplainCommandOut(explanation=service.explain_command(db, lab, body.command))


@router.post("/quiz", response_model=QuizOut)
def generate_quiz(body: QuizRequest, db: Session = Depends(get_db)):
    lab = _get_lab_or_404(body.lab_id, db)
    return service.generate_quiz(db, lab)


@router.get("/quiz/{lab_id}", response_model=list[QuizOut])
def list_quizzes(lab_id: int, db: Session = Depends(get_db)):
    _get_lab_or_404(lab_id, db)
    return db.scalars(select(Quiz).where(Quiz.lab_id == lab_id).order_by(Quiz.created_at.desc())).all()


@router.post("/quiz/{quiz_id}/submit", response_model=QuizOut)
def submit_quiz(quiz_id: int, body: QuizSubmitRequest, db: Session = Depends(get_db)):
    quiz = db.get(Quiz, quiz_id)
    if quiz is None:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return service.submit_quiz(db, quiz, body.answers)


@router.post("/study-notes", response_model=StudyNoteOut)
def generate_study_notes(body: StudyNotesRequest, db: Session = Depends(get_db)):
    lab = _get_lab_or_404(body.lab_id, db)
    return service.generate_study_notes(db, lab)


@router.get("/study-notes/{lab_id}", response_model=list[StudyNoteOut])
def list_study_notes(lab_id: int, db: Session = Depends(get_db)):
    _get_lab_or_404(lab_id, db)
    return db.scalars(
        select(StudyNote).where(StudyNote.lab_id == lab_id).order_by(StudyNote.created_at.desc())
    ).all()
