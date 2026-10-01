from datetime import datetime, timezone
from typing import Any

from sqlalchemy import JSON, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Lab(Base):
    __tablename__ = "labs"
    __table_args__ = (UniqueConstraint("folder_path", name="uq_labs_folder_path"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String)
    cve: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    product: Mapped[str] = mapped_column(String, index=True)
    category: Mapped[str | None] = mapped_column(String, nullable=True)
    difficulty: Mapped[str | None] = mapped_column(String, nullable=True)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    folder_path: Mapped[str] = mapped_column(String, unique=True)
    readme_path: Mapped[str | None] = mapped_column(String, nullable=True)
    compose_path: Mapped[str] = mapped_column(String)
    first_seen_at: Mapped[datetime] = mapped_column(default=_utcnow)
    last_seen_at: Mapped[datetime] = mapped_column(default=_utcnow, onupdate=_utcnow)


class Progress(Base):
    __tablename__ = "progress"
    __table_args__ = (UniqueConstraint("lab_id", name="uq_progress_lab_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    lab_id: Mapped[int] = mapped_column(ForeignKey("labs.id", ondelete="CASCADE"), index=True)
    status: Mapped[str] = mapped_column(String, default="not_started")
    started_at: Mapped[datetime | None] = mapped_column(nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(nullable=True)
    confidence: Mapped[int | None] = mapped_column(nullable=True)


class Quiz(Base):
    __tablename__ = "quizzes"

    id: Mapped[int] = mapped_column(primary_key=True)
    lab_id: Mapped[int] = mapped_column(ForeignKey("labs.id", ondelete="CASCADE"), index=True)
    questions: Mapped[list[dict[str, Any]]] = mapped_column(JSON)
    answers: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    score: Mapped[int | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=_utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(nullable=True)


class StudyNote(Base):
    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(primary_key=True)
    lab_id: Mapped[int] = mapped_column(ForeignKey("labs.id", ondelete="CASCADE"), index=True)
    content: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(default=_utcnow)


class AppSettings(Base):
    __tablename__ = "app_settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    ai_provider: Mapped[str] = mapped_column(String, default="openai")

    kali_vmx_path: Mapped[str | None] = mapped_column(String, nullable=True)
    vulhub_vmx_path: Mapped[str | None] = mapped_column(String, nullable=True)


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[int] = mapped_column(primary_key=True)
    lab_id: Mapped[int] = mapped_column(ForeignKey("labs.id", ondelete="CASCADE"), index=True)
    role: Mapped[str] = mapped_column(String)
    message: Mapped[str] = mapped_column(String)
    mode: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=_utcnow)
