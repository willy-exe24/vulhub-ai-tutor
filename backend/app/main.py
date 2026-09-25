from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings as app_settings
from app.database import SessionLocal, init_db
from app.models import Lab
from app.routers import ai, labs, progress, settings, system, vms
from app.scanner import sync_bundled_library

app = FastAPI(title="Vulhub AI Tutor API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(labs.router)
app.include_router(progress.router)
app.include_router(ai.router)
app.include_router(settings.router)
app.include_router(system.router)
app.include_router(vms.router)


@app.on_event("startup")
def on_startup() -> None:
    init_db()

    db = SessionLocal()
    try:
        if db.query(Lab).count() == 0:
            sync_bundled_library(db, app_settings.bundled_vulhub_path)
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok"}
