"""
FastAPI Main Application Entry Point
Students Performance Estimation System Using AI
Project Owner: Nithyasri S
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.api.auth import router as auth_router
from backend.app.api.students import router as students_router
from backend.app.api.academic_records import router as records_router
from backend.app.api.ml import router as ml_router
from backend.app.api.datasets import router as datasets_router
from backend.app.api.dashboard import router as dashboard_router
from backend.app.api.reports import router as reports_router
from backend.app.api.mongodb_crud import router as mongo_router
from backend.seed_data import seed_all

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure DB schema & initial seed data is populated
    try:
        seed_all()
    except Exception as e:
        print(f"Warning: Seeding during startup encountered: {e}")
    yield
    # Shutdown logic if any

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Full-Stack AI-Powered Educational Data Mining System for Student Performance Estimation, "
        "Explainable Feature Attribution, Early Academic Support Identification, and Personalized "
        "Pedagogical Interventions.\n\n"
        f"**Project Owner:** {settings.PROJECT_OWNER}"
    ),
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(students_router, prefix=settings.API_V1_STR)
app.include_router(records_router, prefix=settings.API_V1_STR)
app.include_router(ml_router, prefix=settings.API_V1_STR)
app.include_router(datasets_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(mongo_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health"])
def root_health():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "project_owner": settings.PROJECT_OWNER,
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
