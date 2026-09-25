from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Lab, Progress, Quiz
from app.schemas import (
    ConfidenceUpdate,
    ProgressLabOut,
    ProgressOut,
    ProgressStatusUpdate,
    ProgressSummary,
)

router = APIRouter(prefix="/progress", tags=["progress"])


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _get_or_create(db: Session, lab_id: int) -> Progress:
    if db.get(Lab, lab_id) is None:
        raise HTTPException(status_code=404, detail="Lab not found")

    row = db.scalar(select(Progress).where(Progress.lab_id == lab_id))
    if row is None:
        row = Progress(lab_id=lab_id, status="not_started")
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


@router.get("", response_model=ProgressSummary)
def get_progress_summary(db: Session = Depends(get_db)):
    labs_discovered = db.scalar(select(func.count()).select_from(Lab)) or 0
    labs_started = (
        db.scalar(
            select(func.count()).select_from(Progress).where(Progress.status.in_(["in_progress", "completed"]))
        )
        or 0
    )
    labs_completed = (
        db.scalar(select(func.count()).select_from(Progress).where(Progress.status == "completed")) or 0
    )
    quizzes_completed = (
        db.scalar(select(func.count()).select_from(Quiz).where(Quiz.completed_at.is_not(None))) or 0
    )
    average_quiz_score = db.scalar(select(func.avg(Quiz.score)).where(Quiz.completed_at.is_not(None)))

    category_rows = (
        db.execute(
            select(Lab.category, func.count())
            .join(Progress, Progress.lab_id == Lab.id)
            .where(Progress.status.in_(["in_progress", "completed"]))
            .group_by(Lab.category)
        )
        .all()
    )
    categories_studied = {(category or "Uncategorized"): count for category, count in category_rows}

    return ProgressSummary(
        labs_discovered=labs_discovered,
        labs_started=labs_started,
        labs_completed=labs_completed,
        quizzes_completed=quizzes_completed,
        average_quiz_score=round(average_quiz_score, 1) if average_quiz_score is not None else None,
        categories_studied=categories_studied,
    )


@router.get("/labs", response_model=list[ProgressLabOut])
def list_lab_progress(db: Session = Depends(get_db)):
    rows = (
        db.execute(
            select(Progress, Lab)
            .join(Lab, Lab.id == Progress.lab_id)
            .where(Progress.status.in_(["in_progress", "completed"]))
            .order_by(func.coalesce(Progress.completed_at, Progress.started_at).desc())
        )
        .all()
    )

    lab_ids = [lab.id for _, lab in rows]
    latest_score_by_lab: dict[int, int] = {}
    if lab_ids:
        quiz_rows = db.execute(
            select(Quiz.lab_id, Quiz.score)
            .where(Quiz.lab_id.in_(lab_ids), Quiz.completed_at.is_not(None))
            .order_by(Quiz.completed_at.desc())
        ).all()
        for quiz_lab_id, score in quiz_rows:
            latest_score_by_lab.setdefault(quiz_lab_id, score)

    return [
        ProgressLabOut(
            lab_id=lab.id,
            lab_name=lab.name,
            product=lab.product,
            cve=lab.cve,
            category=lab.category,
            status=progress.status,
            confidence=progress.confidence,
            started_at=progress.started_at,
            completed_at=progress.completed_at,
            latest_quiz_score=latest_score_by_lab.get(lab.id),
        )
        for progress, lab in rows
    ]


@router.get("/{lab_id}", response_model=ProgressOut)
def get_lab_progress(lab_id: int, db: Session = Depends(get_db)):
    return _get_or_create(db, lab_id)


@router.put("/{lab_id}", response_model=ProgressOut)
def set_lab_progress(lab_id: int, body: ProgressStatusUpdate, db: Session = Depends(get_db)):
    row = _get_or_create(db, lab_id)
    row.status = body.status

    if body.status == "not_started":
        row.started_at = None
        row.completed_at = None
    elif body.status == "in_progress":
        row.started_at = row.started_at or _utcnow()
        row.completed_at = None
    elif body.status == "completed":
        row.started_at = row.started_at or _utcnow()
        row.completed_at = _utcnow()

    db.commit()
    db.refresh(row)
    return row


@router.put("/{lab_id}/confidence", response_model=ProgressOut)
def set_confidence(lab_id: int, body: ConfidenceUpdate, db: Session = Depends(get_db)):
    if not 1 <= body.confidence <= 5:
        raise HTTPException(status_code=422, detail="confidence must be between 1 and 5")
    row = _get_or_create(db, lab_id)
    row.confidence = body.confidence
    db.commit()
    db.refresh(row)
    return row
