"""
Machine Learning & Performance Estimation API Routes
Students Performance Estimation System Using AI
Project Owner: Nithyasri S
"""

import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.api.auth import get_current_user, require_roles
from backend.app.models.db_models import User, Student, PredictionHistory, ModelRegistry
from backend.app.schemas.api_schemas import (
    PredictionRequest, PredictionResponse, PredictionHistoryOut
)
from backend.app.ml.pipeline import ml_service, FEATURE_COLUMNS
from ml.scripts.train_models import train_and_evaluate

router = APIRouter(prefix="/ml", tags=["Machine Learning"])

@router.post("/predict", response_model=PredictionResponse)
def estimate_performance(
    req: PredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    feature_dict = {
        "attendance_percentage": req.attendance_percentage,
        "internal_marks": req.internal_marks,
        "assignment_score": req.assignment_score,
        "practical_score": req.practical_score,
        "previous_semester_percentage": req.previous_semester_percentage,
        "study_hours_per_week": req.study_hours_per_week,
        "assignment_completion_percentage": req.assignment_completion_percentage,
        "learning_activity_score": req.learning_activity_score
    }

    # Run inference pipeline
    result = ml_service.predict(feature_dict, model_override=req.model_override)

    # Resolve student name if student_id was provided
    student_name = req.student_name
    if req.student_id and not student_name:
        stu = db.query(Student).filter(Student.student_id == req.student_id).first()
        if stu:
            student_name = stu.name

    # Save to PredictionHistory
    history = PredictionHistory(
        student_id=req.student_id,
        student_name=student_name,
        model_name=result["model_name"],
        estimated_score=result["estimated_score"],
        lower_bound=result["lower_bound"],
        upper_bound=result["upper_bound"],
        performance_category=result["performance_category"],
        support_priority=result["support_priority"],
        confidence_note=f"Residual standard error: ±{result['residual_standard_error']}",
        feature_inputs_json=json.dumps(feature_dict),
        explanation_notes_json=json.dumps({
            "feature_impacts": result["feature_impacts"],
            "early_triggers": result["early_support_triggers"]
        }),
        performed_by=current_user.full_name
    )
    db.add(history)
    db.commit()

    return result

@router.get("/models")
def get_model_benchmarks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meta = ml_service.metadata
    available_models = list(ml_service.models.keys())
    
    # Also fetch from DB if populated
    db_models = db.query(ModelRegistry).all()
    models_list = []
    if db_models:
        for m in db_models:
            models_list.append({
                "id": m.id,
                "name": m.name,
                "algorithm": m.algorithm,
                "version": m.version,
                "mae": m.mae,
                "rmse": m.rmse,
                "r2_score": m.r2_score,
                "is_active": m.name == ml_service.active_model_name,
                "trained_at": m.trained_at
            })
    else:
        # Fall back to metadata benchmarks
        benchmarks = meta.get("all_model_benchmarks", {})
        for name, metrics in benchmarks.items():
            models_list.append({
                "name": name,
                "algorithm": name,
                "version": meta.get("version", "1.0.0"),
                "mae": metrics.get("mae", 0.0),
                "rmse": metrics.get("rmse", 0.0),
                "r2_score": metrics.get("r2_score", 0.0),
                "cv_r2_mean": metrics.get("cv_r2_mean", 0.0),
                "cv_r2_std": metrics.get("cv_r2_std", 0.0),
                "is_active": name == ml_service.active_model_name
            })

    return {
        "active_model": ml_service.active_model_name,
        "model_version": meta.get("version", "1.0.0"),
        "trained_at": meta.get("trained_at"),
        "dataset_rows": meta.get("dataset_rows", 1200),
        "available_models": available_models,
        "benchmarks": models_list,
        "feature_importances": meta.get("feature_importances", {}),
        "residual_standard_error": meta.get("residual_standard_error", 3.37)
    }

@router.post("/models/{model_name}/activate")
def activate_model(
    model_name: str,
    current_user: User = Depends(require_roles(["admin", "teacher"])),
    db: Session = Depends(get_db)
):
    success = ml_service.set_active_model(model_name)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model '{model_name}' is not recognized or loaded in memory."
        )

    # Update DB active states
    db.query(ModelRegistry).update({ModelRegistry.is_active: False})
    db_target = db.query(ModelRegistry).filter(ModelRegistry.name == model_name).first()
    if db_target:
        db_target.is_active = True
    db.commit()

    return {
        "message": f"Active estimation model successfully switched to '{model_name}'.",
        "active_model": model_name
    }

@router.post("/train")
def retrain_models(
    current_user: User = Depends(require_roles(["admin"])),
    db: Session = Depends(get_db)
):
    try:
        new_meta = train_and_evaluate()
        # Reload ml_service with newly trained models
        ml_service.__init__()

        # Sync DB ModelRegistry
        for name, metrics in new_meta.get("all_model_benchmarks", {}).items():
            reg = db.query(ModelRegistry).filter(ModelRegistry.name == name).first()
            if not reg:
                reg = ModelRegistry(
                    name=name,
                    algorithm=name,
                    version=new_meta.get("version", "1.0.0"),
                    mae=metrics.get("mae", 0.0),
                    rmse=metrics.get("rmse", 0.0),
                    r2_score=metrics.get("r2_score", 0.0),
                    is_active=(name == new_meta.get("champion_model")),
                    metrics_json=json.dumps(metrics),
                    feature_importances_json=json.dumps(new_meta.get("feature_importances", {}))
                )
                db.add(reg)
            else:
                reg.mae = metrics.get("mae", 0.0)
                reg.rmse = metrics.get("rmse", 0.0)
                reg.r2_score = metrics.get("r2_score", 0.0)
                reg.is_active = (name == new_meta.get("champion_model"))
                reg.metrics_json = json.dumps(metrics)
                reg.feature_importances_json = json.dumps(new_meta.get("feature_importances", {}))

        db.commit()

        return {
            "message": "Model re-training and evaluation workflow completed successfully.",
            "champion_model": new_meta.get("champion_model"),
            "metrics": new_meta.get("champion_metrics"),
            "all_benchmarks": new_meta.get("all_model_benchmarks")
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model training workflow encountered an error: {str(e)}"
        )

@router.get("/history", response_model=dict)
def get_prediction_history(
    student_id: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(PredictionHistory)

    if current_user.role == "student":
        query = query.filter(PredictionHistory.student_id == current_user.student_id)
    elif student_id:
        query = query.filter(PredictionHistory.student_id == student_id)

    total = query.count()
    items = query.order_by(PredictionHistory.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": items
    }
