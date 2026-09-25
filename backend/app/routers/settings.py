from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.ai import provider as ai_provider
from app.ai import service
from app.config import settings
from app.database import get_db
from app.schemas import AiSettingsOut, AiSettingsUpdate

router = APIRouter(prefix="/settings", tags=["settings"])


def _current(db: Session) -> AiSettingsOut:
    return AiSettingsOut(
        provider=service.get_active_provider(db),
        openai_configured=ai_provider.is_configured("openai"),
        anthropic_configured=ai_provider.is_configured("anthropic"),
        openai_model=settings.openai_model,
        anthropic_model=settings.anthropic_model,
    )


@router.get("/ai", response_model=AiSettingsOut)
def get_ai_settings(db: Session = Depends(get_db)):
    return _current(db)


@router.put("/ai", response_model=AiSettingsOut)
def update_ai_settings(body: AiSettingsUpdate, db: Session = Depends(get_db)):
    service.set_active_provider(db, body.provider)
    return _current(db)
