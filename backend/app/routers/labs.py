from pathlib import Path, PurePosixPath

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.compose_info import parse_compose_ports
from app.config import settings
from app.database import get_db
from app.models import Lab
from app.schemas import LabOut, PortMappingOut, ReadmeOut, RescanResult, RunInstructionsOut
from app.scanner import sync_bundled_library

router = APIRouter(prefix="/labs", tags=["labs"])


@router.get("", response_model=list[LabOut])
def list_labs(
    search: str | None = None,
    product: str | None = None,
    category: str | None = None,
    difficulty: str | None = None,
    db: Session = Depends(get_db),
):
    query = select(Lab)

    if search:
        pattern = f"%{search}%"
        query = query.where(
            or_(Lab.name.ilike(pattern), Lab.product.ilike(pattern), Lab.cve.ilike(pattern))
        )
    if product:
        query = query.where(Lab.product == product)
    if category:
        query = query.where(Lab.category == category)
    if difficulty:
        query = query.where(Lab.difficulty == difficulty)

    return db.scalars(query.order_by(Lab.product, Lab.name)).all()


@router.post("/rescan", response_model=RescanResult)
def rescan_labs(db: Session = Depends(get_db)):
    result = sync_bundled_library(db, settings.bundled_vulhub_path)
    return RescanResult(**result.__dict__)


def _get_lab_or_404(lab_id: int, db: Session) -> Lab:
    lab = db.get(Lab, lab_id)
    if lab is None:
        raise HTTPException(status_code=404, detail="Lab not found")
    return lab


@router.get("/{lab_id}", response_model=LabOut)
def get_lab(lab_id: int, db: Session = Depends(get_db)):
    return _get_lab_or_404(lab_id, db)


@router.get("/{lab_id}/readme", response_model=ReadmeOut)
def get_lab_readme(lab_id: int, db: Session = Depends(get_db)):
    lab = _get_lab_or_404(lab_id, db)
    if not lab.readme_path:
        return ReadmeOut(content=None)
    path = Path(lab.readme_path)
    if not path.is_file():
        return ReadmeOut(content=None)
    return ReadmeOut(content=path.read_text(encoding="utf-8", errors="ignore"))


@router.get("/{lab_id}/run-instructions", response_model=RunInstructionsOut)
def get_run_instructions(lab_id: int, db: Session = Depends(get_db)):
    lab = _get_lab_or_404(lab_id, db)
    relative_path = str(PurePosixPath(lab.product) / lab.name)
    ports = [PortMappingOut.model_validate(p) for p in parse_compose_ports(Path(lab.compose_path))]
    return RunInstructionsOut(relative_path=relative_path, ports=ports)
