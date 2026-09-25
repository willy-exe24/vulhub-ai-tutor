"""Helpers for reading/updating VM configuration (app_settings table)."""

from sqlalchemy.orm import Session

from app.config import settings
from app.models import AppSettings


def get_app_settings(db: Session) -> AppSettings:
    row = db.get(AppSettings, 1)
    if row is None:
        # Seed from backend/.env bootstrap defaults on first run only; after
        # that, the DB row (editable via Settings) is the source of truth.
        row = AppSettings(
            id=1,
            kali_vmx_path=str(settings.kali_vmx_path) if settings.kali_vmx_path else None,
            vulhub_vmx_path=str(settings.vulhub_vmx_path) if settings.vulhub_vmx_path else None,
        )
        db.add(row)
        db.commit()
        db.refresh(row)
    return row
