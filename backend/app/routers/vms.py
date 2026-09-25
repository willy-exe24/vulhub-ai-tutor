from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.infra_service import get_app_settings
from app.vm_control import VmwareError, discover_vms, get_vm_status, start_vm, stop_vm
from app.schemas import DiscoveredVmOut, KaliVmOut, VmConfigOut, VmConfigUpdate

router = APIRouter(prefix="/vms", tags=["vms"])


@router.get("/discover", response_model=list[DiscoveredVmOut])
def discover(db: Session = Depends(get_db)):
    library_path = settings.vm_library_path
    return [DiscoveredVmOut.model_validate(vm) for vm in discover_vms(library_path)]


def _vm_config_out(db: Session) -> VmConfigOut:
    row = get_app_settings(db)
    kali_path = Path(row.kali_vmx_path) if row.kali_vmx_path else None
    vulhub_path = Path(row.vulhub_vmx_path) if row.vulhub_vmx_path else None
    return VmConfigOut(
        kali_vmx_path=row.kali_vmx_path,
        vulhub_vmx_path=row.vulhub_vmx_path,
        kali_status=KaliVmOut.model_validate(get_vm_status(kali_path)),
        vulhub_status=KaliVmOut.model_validate(get_vm_status(vulhub_path)),
    )


@router.get("/config", response_model=VmConfigOut)
def get_config(db: Session = Depends(get_db)):
    return _vm_config_out(db)


@router.put("/config", response_model=VmConfigOut)
def update_config(body: VmConfigUpdate, db: Session = Depends(get_db)):
    row = get_app_settings(db)
    # Use model_fields_set (not `is not None`) so an explicit null in the
    # request actually clears a field, rather than being indistinguishable
    # from the field being omitted entirely.
    fields = body.model_fields_set
    if "kali_vmx_path" in fields:
        row.kali_vmx_path = body.kali_vmx_path or None
    if "vulhub_vmx_path" in fields:
        row.vulhub_vmx_path = body.vulhub_vmx_path or None
    db.commit()
    return _vm_config_out(db)


@router.post("/kali/start", response_model=KaliVmOut)
def start_kali(db: Session = Depends(get_db)):
    row = get_app_settings(db)
    if not row.kali_vmx_path:
        raise HTTPException(status_code=400, detail="No Kali VM configured")
    try:
        start_vm(Path(row.kali_vmx_path))
    except VmwareError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return KaliVmOut.model_validate(get_vm_status(Path(row.kali_vmx_path)))


@router.post("/kali/stop", response_model=KaliVmOut)
def stop_kali(db: Session = Depends(get_db)):
    row = get_app_settings(db)
    if not row.kali_vmx_path:
        raise HTTPException(status_code=400, detail="No Kali VM configured")
    try:
        stop_vm(Path(row.kali_vmx_path))
    except VmwareError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return KaliVmOut.model_validate(get_vm_status(Path(row.kali_vmx_path)))


@router.post("/vulhub/start", response_model=KaliVmOut)
def start_vulhub_vm(db: Session = Depends(get_db)):
    row = get_app_settings(db)
    if not row.vulhub_vmx_path:
        raise HTTPException(status_code=400, detail="No Vulhub VM configured")
    try:
        start_vm(Path(row.vulhub_vmx_path))
    except VmwareError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return KaliVmOut.model_validate(get_vm_status(Path(row.vulhub_vmx_path)))


@router.post("/vulhub/stop", response_model=KaliVmOut)
def stop_vulhub_vm(db: Session = Depends(get_db)):
    row = get_app_settings(db)
    if not row.vulhub_vmx_path:
        raise HTTPException(status_code=400, detail="No Vulhub VM configured")
    try:
        stop_vm(Path(row.vulhub_vmx_path))
    except VmwareError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return KaliVmOut.model_validate(get_vm_status(Path(row.vulhub_vmx_path)))
