from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
    pass


settings.database_path.parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},
)


@event.listens_for(engine, "connect")
def _enable_foreign_keys(dbapi_connection, _record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def _ensure_columns() -> None:
    """Lightweight additive migration.

    ``create_all`` creates missing tables but never ALTERs existing ones, so a
    new model column (e.g. ``labs.description``) won't appear on a database that
    predates it. This adds any nullable/defaulted model columns that are missing
    from an existing table. Safe to run on every startup.
    """
    from sqlalchemy import inspect, text

    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    with engine.begin() as conn:
        for table in Base.metadata.sorted_tables:
            if table.name not in existing_tables:
                continue  # create_all will have made it with all columns
            have = {col["name"] for col in inspector.get_columns(table.name)}
            for column in table.columns:
                if column.name in have:
                    continue
                # SQLite can only ADD a column that is nullable or defaulted.
                if not column.nullable and column.default is None and column.server_default is None:
                    continue
                coltype = column.type.compile(dialect=engine.dialect)
                conn.execute(
                    text(f'ALTER TABLE "{table.name}" ADD COLUMN "{column.name}" {coltype}')
                )


def init_db() -> None:
    from app import models  # noqa: F401 (ensure models are registered)

    Base.metadata.create_all(bind=engine)
    _ensure_columns()


def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
