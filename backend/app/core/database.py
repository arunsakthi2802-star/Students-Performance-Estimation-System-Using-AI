"""
Database Engine & Session Management
Students Performance Estimation System Using AI
Project Owner: Nithyasri S
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from backend.app.core.config import settings

# For SQLite, check_same_thread=False allows multi-threaded FastAPI workers
connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency that provides a database session and safely closes it upon request completion."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
