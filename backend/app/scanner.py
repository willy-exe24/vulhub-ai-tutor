"""Scans the bundled Vulhub lab library (README + docker-compose files,
shipped with this repo — see backend/vulhub_data/) and reconciles it into
the labs table. The app never runs Docker itself; this is purely a static
reference library plus metadata for the AI tutor/quiz/notes features.
"""

import re
from dataclasses import dataclass
from pathlib import Path

from sqlalchemy.orm import Session

from app.models import Lab, _utcnow

COMPOSE_FILENAMES = (
    "docker-compose.yml",
    "docker-compose.yaml",
    "compose.yml",
    "compose.yaml",
)
README_FILENAMES = ("README.md", "readme.md", "README.MD")

CVE_PATTERN = re.compile(r"CVE-\d{4}-\d+", re.IGNORECASE)

# Best-effort category inference from README keywords. Vulhub itself doesn't
# label categories, so this is a heuristic, not an authoritative taxonomy —
# order matters (first match wins) so more specific terms are checked first.
CATEGORY_KEYWORDS: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("SQL Injection", ("sql injection",)),
    ("Command Injection", ("command injection", "os command injection")),
    ("Deserialization", ("deserialization", "deserialisation")),
    ("Server-Side Request Forgery", ("server-side request forgery", "ssrf")),
    ("XML External Entity", ("xml external entity", "xxe")),
    ("Path Traversal", ("path traversal", "directory traversal")),
    ("Cross-Site Scripting", ("cross-site scripting", "xss")),
    ("Cross-Site Request Forgery", ("cross-site request forgery", "csrf")),
    ("Authentication Bypass", ("authentication bypass", "auth bypass")),
    ("Privilege Escalation", ("privilege escalation",)),
    ("Arbitrary File Write", ("arbitrary file write",)),
    ("Arbitrary File Read", ("arbitrary file read",)),
    ("Denial of Service", ("denial of service",)),
    ("Information Disclosure", ("information disclosure",)),
    ("Remote Code Execution", ("remote code execution", "rce")),
)


def infer_category(readme_text: str | None) -> str | None:
    if not readme_text:
        return None
    lowered = readme_text.lower()
    for category, keywords in CATEGORY_KEYWORDS:
        for keyword in keywords:
            if re.search(r"\b" + re.escape(keyword) + r"\b", lowered):
                return category
    return None


@dataclass(frozen=True)
class DiscoveredLab:
    name: str
    product: str
    cve: str | None
    category: str | None
    folder_path: str
    readme_path: str | None
    compose_path: str


def _first_existing(directory: Path, filenames: tuple[str, ...]) -> Path | None:
    for filename in filenames:
        candidate = directory / filename
        if candidate.is_file():
            return candidate
    return None


def scan_bundled_library(library_root: Path) -> list[DiscoveredLab]:
    """Walk the bundled vulhub_data/ directory and return every lab found."""
    library_root = Path(library_root)
    if not library_root.is_dir():
        return []

    labs: list[DiscoveredLab] = []
    for product_dir in sorted(p for p in library_root.iterdir() if p.is_dir()):
        if product_dir.name.startswith("."):
            continue
        for lab_dir in sorted(p for p in product_dir.iterdir() if p.is_dir()):
            compose_path = _first_existing(lab_dir, COMPOSE_FILENAMES)
            if compose_path is None:
                continue

            readme_path = _first_existing(lab_dir, README_FILENAMES)
            cve_match = CVE_PATTERN.match(lab_dir.name)

            readme_text = None
            if readme_path is not None:
                readme_text = readme_path.read_text(encoding="utf-8", errors="ignore")

            labs.append(
                DiscoveredLab(
                    name=lab_dir.name,
                    product=product_dir.name,
                    cve=cve_match.group(0).upper() if cve_match else None,
                    category=infer_category(readme_text),
                    folder_path=str(lab_dir.resolve()),
                    readme_path=str(readme_path.resolve()) if readme_path else None,
                    compose_path=str(compose_path.resolve()),
                )
            )
    return labs


@dataclass(frozen=True)
class SyncResult:
    total_found: int
    added: int
    updated: int
    removed: int


def sync_discovered_labs(db: Session, discovered: list[DiscoveredLab]) -> SyncResult:
    """Reconcile the labs table with a freshly discovered list."""
    discovered_by_path = {lab.folder_path: lab for lab in discovered}
    existing = {lab.folder_path: lab for lab in db.query(Lab).all()}

    added = updated = 0
    for folder_path, found in discovered_by_path.items():
        row = existing.get(folder_path)
        if row is not None:
            row.last_seen_at = _utcnow()
        if row is None:
            db.add(
                Lab(
                    name=found.name,
                    product=found.product,
                    cve=found.cve,
                    category=found.category,
                    folder_path=found.folder_path,
                    readme_path=found.readme_path,
                    compose_path=found.compose_path,
                )
            )
            added += 1
        else:
            changed = (
                row.name != found.name
                or row.product != found.product
                or row.cve != found.cve
                or row.category != found.category
                or row.readme_path != found.readme_path
                or row.compose_path != found.compose_path
            )
            if changed:
                row.name = found.name
                row.product = found.product
                row.cve = found.cve
                row.category = found.category
                row.readme_path = found.readme_path
                row.compose_path = found.compose_path
                updated += 1

    removed = 0
    for folder_path, row in existing.items():
        if folder_path not in discovered_by_path:
            db.delete(row)
            removed += 1

    db.commit()

    return SyncResult(
        total_found=len(discovered),
        added=added,
        updated=updated,
        removed=removed,
    )


def sync_bundled_library(db: Session, library_root: Path) -> SyncResult:
    return sync_discovered_labs(db, scan_bundled_library(library_root))
