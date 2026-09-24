"""
Dashboard Analytics API Routes
Students Performance Estimation System Using AI
Project Owner: Nithyasri S
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.core.database import get_db
from backend.app.api.auth import get_current_user, require_roles
from backend.app.models.db_models import (
    User, Student, AcademicRecord, PredictionHistory, SupportNote, ModelRegistry, DatasetUpload
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/overview")
def get_overview_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_students = db.query(Student).count()
    total_records = db.query(AcademicRecord).count()
    total_predictions = db.query(PredictionHistory).count()
    total_support_notes = db.query(SupportNote).count()

    # Calculate system averages
    avg_attendance = db.query(func.avg(AcademicRecord.attendance_percentage)).scalar() or 0.0
    avg_internals = db.query(func.avg(AcademicRecord.internal_marks)).scalar() or 0.0
    avg_practicals = db.query(func.avg(AcademicRecord.practical_score)).scalar() or 0.0
    avg_completion = db.query(func.avg(AcademicRecord.assignment_completion_percentage)).scalar() or 0.0
    avg_study_hrs = db.query(func.avg(AcademicRecord.study_hours_per_week)).scalar() or 0.0

    # Categorical distribution of predictions
    categories = db.query(
        PredictionHistory.performance_category, func.count(PredictionHistory.id)
    ).group_by(PredictionHistory.performance_category).all()
    category_dist = {cat: count for cat, count in categories}

    # Support priority breakdown
    priorities = db.query(
        PredictionHistory.support_priority, func.count(PredictionHistory.id)
    ).group_by(PredictionHistory.support_priority).all()
    priority_dist = {p: count for p, count in priorities}

    # Department student counts
    dept_counts = db.query(
        Student.department, func.count(Student.id)
    ).group_by(Student.department).all()
    department_distribution = [{"department": dept, "count": count} for dept, count in dept_counts]

    # Recent predictions
    recent_preds = db.query(PredictionHistory).order_by(PredictionHistory.created_at.desc()).limit(6).all()

    # Early support attention count (attendance < 75% or internals < 50)
    attention_needed_students = db.query(Student.student_id).join(AcademicRecord).filter(
        (AcademicRecord.attendance_percentage < 75.0) | (AcademicRecord.internal_marks < 50.0)
    ).distinct().count()

    return {
        "metrics": {
            "total_students": total_students,
            "total_records": total_records,
            "total_predictions": total_predictions,
            "active_support_notes": total_support_notes,
            "attention_needed_count": attention_needed_students,
            "avg_attendance": round(float(avg_attendance), 1),
            "avg_internals": round(float(avg_internals), 1),
            "avg_practicals": round(float(avg_practicals), 1),
            "avg_completion_pct": round(float(avg_completion), 1),
            "avg_study_hours": round(float(avg_study_hrs), 1)
        },
        "performance_distribution": {
            "Distinction": category_dist.get("Distinction", 0),
            "First Class": category_dist.get("First Class", 0),
            "Pass / Average": category_dist.get("Pass / Average", 0),
            "Needs Support": category_dist.get("Needs Support", 0)
        },
        "priority_distribution": priority_dist,
        "department_distribution": department_distribution,
        "recent_predictions": [
            {
                "id": p.id,
                "student_id": p.student_id,
                "student_name": p.student_name,
                "model_name": p.model_name,
                "estimated_score": p.estimated_score,
                "lower_bound": p.lower_bound,
                "upper_bound": p.upper_bound,
                "performance_category": p.performance_category,
                "support_priority": p.support_priority,
                "created_at": p.created_at
            }
            for p in recent_preds
        ]
    }

@router.get("/admin")
def get_admin_dashboard(
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    users_by_role = db.query(User.role, func.count(User.id)).group_by(User.role).all()
    models = db.query(ModelRegistry).all()
    uploads = db.query(DatasetUpload).order_by(DatasetUpload.created_at.desc()).limit(5).all()

    return {
        "user_roles": {role: count for role, count in users_by_role},
        "total_users": db.query(User).count(),
        "total_students": db.query(Student).count(),
        "registered_models": [
            {
                "id": m.id,
                "name": m.name,
                "version": m.version,
                "r2_score": m.r2_score,
                "mae": m.mae,
                "rmse": m.rmse,
                "is_active": m.is_active,
                "trained_at": m.trained_at
            }
            for m in models
        ],
        "recent_uploads": [
            {
                "id": u.id,
                "filename": u.filename,
                "row_count": u.row_count,
                "status": u.status,
                "uploaded_by": u.uploaded_by,
                "created_at": u.created_at
            }
            for u in uploads
        ]
    }
