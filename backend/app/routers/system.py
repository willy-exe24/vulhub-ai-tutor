from pathlib import Path

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.ai import provider as ai_provider
from app.ai import service
from app.database import get_db
from app.infra_service import get_app_settings
from app.schemas import KaliVmOut, SystemStatusOut
from app.vm_control import get_vm_status

router = APIRouter(prefix="/system", tags=["system"])


@router.get("/status", response_model=SystemStatusOut)
def get_system_status(db: Session = Depends(get_db)):
    active_provider = service.get_active_provider(db)
    row = get_app_settings(db)

    return SystemStatusOut(
        ai_provider=active_provider,
        ai_configured=ai_provider.is_configured(active_provider),
        kali=KaliVmOut.model_validate(get_vm_status(Path(row.kali_vmx_path) if row.kali_vmx_path else None)),
        vulhub_vm=KaliVmOut.model_validate(
            get_vm_status(Path(row.vulhub_vmx_path) if row.vulhub_vmx_path else None)
        ),
    )
