from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


class LabOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    cve: str | None
    product: str
    category: str | None
    difficulty: str | None
    description: str | None
    folder_path: str
    readme_path: str | None
    compose_path: str
    first_seen_at: datetime
    last_seen_at: datetime


class RescanResult(BaseModel):
    total_found: int
    added: int
    updated: int
    removed: int


class ReadmeOut(BaseModel):
    content: str | None


class PortMappingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    host_port: int
    container_port: int
    protocol: str


class RunInstructionsOut(BaseModel):
    """Where this lab lives and what it exposes, for running it by hand."""

    relative_path: str  # e.g. "grafana/CVE-2021-43798" — where it lives once you clone vulhub yourself
    ports: list[PortMappingOut]


ProgressStatus = Literal["not_started", "in_progress", "completed"]


class ProgressOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    lab_id: int
    status: ProgressStatus
    started_at: datetime | None
    completed_at: datetime | None
    confidence: int | None


class ProgressStatusUpdate(BaseModel):
    status: ProgressStatus


class ConfidenceUpdate(BaseModel):
    confidence: int


class ProgressLabOut(BaseModel):
    lab_id: int
    lab_name: str
    product: str
    cve: str | None
    category: str | None
    status: ProgressStatus
    confidence: int | None
    started_at: datetime | None
    completed_at: datetime | None
    latest_quiz_score: int | None


class ProgressSummary(BaseModel):
    labs_discovered: int
    labs_started: int
    labs_completed: int
    quizzes_completed: int
    average_quiz_score: float | None
    categories_studied: dict[str, int]


AiMode = Literal["beginner", "technical", "hint"]


class ExplainRequest(BaseModel):
    lab_id: int
    mode: AiMode = "beginner"


class AiExplanationOut(BaseModel):
    what_is_it: str
    why_it_happens: str
    attacker_impact: str
    what_to_learn: str
    detection: str
    mitigation: str
    stubbed: bool


class ChatRequest(BaseModel):
    lab_id: int
    message: str
    mode: AiMode = "beginner"


class ChatMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    lab_id: int
    role: Literal["user", "assistant"]
    message: str
    created_at: datetime


class ExplainCommandRequest(BaseModel):
    lab_id: int
    command: str


class ExplainCommandOut(BaseModel):
    explanation: str


QuestionType = Literal["multiple_choice", "true_false", "short_answer"]


class QuizQuestionOut(BaseModel):
    question: str
    type: QuestionType
    options: list[str] | None
    correct_answer: str
    explanation: str
    # Set once the quiz is graded; null on a freshly generated (ungraded) quiz.
    is_correct: bool | None = None


class QuizRequest(BaseModel):
    lab_id: int


class QuizOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    lab_id: int
    questions: list[QuizQuestionOut]
    answers: list[str] | None
    score: int | None
    created_at: datetime
    completed_at: datetime | None


class QuizSubmitRequest(BaseModel):
    answers: list[str]


class StudyNotesRequest(BaseModel):
    lab_id: int


class StudyNoteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    lab_id: int
    content: str
    created_at: datetime


AiProviderName = Literal["openai", "anthropic"]


class AiSettingsOut(BaseModel):
    provider: AiProviderName
    openai_configured: bool
    anthropic_configured: bool
    openai_model: str
    anthropic_model: str


class AiSettingsUpdate(BaseModel):
    provider: AiProviderName


class KaliVmOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    configured: bool
    available: bool
    running: bool
    vmx_path: str | None
    error: str | None = None


class SystemStatusOut(BaseModel):
    api: Literal["online"] = "online"
    ai_provider: AiProviderName
    ai_configured: bool
    kali: KaliVmOut
    vulhub_vm: KaliVmOut


class DiscoveredVmOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    vmx_path: str
    running: bool


class VmConfigOut(BaseModel):
    kali_vmx_path: str | None
    vulhub_vmx_path: str | None
    kali_status: KaliVmOut
    vulhub_status: KaliVmOut


class VmConfigUpdate(BaseModel):
    kali_vmx_path: str | None = None
    vulhub_vmx_path: str | None = None
