"""
ML Pipeline & Inference Service
Students Performance Estimation System Using AI
Project Owner: Nithyasri S
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Optional, Any
from backend.app.services.recommendations import generate_academic_recommendations
from backend.app.services.support_alerts import evaluate_early_support_triggers

ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), "artifacts")

FEATURE_COLUMNS = [
    "attendance_percentage",
    "internal_marks",
    "assignment_score",
    "practical_score",
    "previous_semester_percentage",
    "study_hours_per_week",
    "assignment_completion_percentage",
    "learning_activity_score"
]

FEATURE_LABELS = {
    "attendance_percentage": "Classroom Attendance",
    "internal_marks": "Continuous Internal Assessment",
    "assignment_score": "Assignment Quality Score",
    "practical_score": "Practical & Lab Performance",
    "previous_semester_percentage": "Previous Semester Aggregate",
    "study_hours_per_week": "Weekly Self-Study Hours",
    "assignment_completion_percentage": "Assignment Completion Rate",
    "learning_activity_score": "LMS & Quiz Learning Engagement"
}

FEATURE_BASELINES = {
    "attendance_percentage": 76.5,
    "internal_marks": 72.0,
    "assignment_score": 75.0,
    "practical_score": 74.0,
    "previous_semester_percentage": 71.0,
    "study_hours_per_week": 17.0,
    "assignment_completion_percentage": 78.0,
    "learning_activity_score": 70.0
}

class MLInferenceEngine:
    def __init__(self):
        self.metadata = self._load_metadata()
        self.active_model_name = self.metadata.get("champion_model", "Linear Regression")
        self.models = self._load_all_models()
        self.active_pipeline = self.models.get(self.active_model_name)
        if self.active_pipeline is None and self.models:
            self.active_pipeline = next(iter(self.models.values()))

    def _load_metadata(self) -> dict[str, Any]:
        meta_path = os.path.join(ARTIFACT_DIR, "model_metadata.json")
        if os.path.exists(meta_path):
            try:
                with open(meta_path, "r") as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading model metadata: {e}")
        return {
            "version": "1.0.0",
            "champion_model": "Linear Regression",
            "residual_standard_error": 3.37,
            "feature_importances": {col: 0.125 for col in FEATURE_COLUMNS}
        }

    def _load_all_models(self) -> dict[str, Any]:
        models = {}
        model_files = {
            "Linear Regression": "linear_regression.joblib",
            "Ridge Regression": "ridge_regression.joblib",
            "Random Forest Regressor": "random_forest_regressor.joblib",
            "Gradient Boosting Regressor": "gradient_boosting_regressor.joblib"
        }
        for name, fname in model_files.items():
            path = os.path.join(ARTIFACT_DIR, fname)
            if os.path.exists(path):
                try:
                    models[name] = joblib.load(path)
                except Exception as e:
                    print(f"Could not load {name} from {path}: {e}")
        
        # Fallback to champion model file if individual files aren't found
        champion_path = os.path.join(ARTIFACT_DIR, "student_performance_champion_model.joblib")
        if not models and os.path.exists(champion_path):
            models["Champion Model"] = joblib.load(champion_path)
            
        return models

    def set_active_model(self, model_name: str) -> bool:
        if model_name in self.models:
            self.active_model_name = model_name
            self.active_pipeline = self.models[model_name]
            return True
        return False

    def predict(self, feature_data: dict[str, float], model_override: Optional[str] = None) -> dict[str, Any]:
        pipeline = self.active_pipeline
        chosen_model_name = self.active_model_name

        if model_override and model_override in self.models:
            pipeline = self.models[model_override]
            chosen_model_name = model_override

        if pipeline is None:
            # Fallback estimation heuristic if model files fail
            estimated = (
                0.26 * feature_data["internal_marks"] +
                0.20 * feature_data["practical_score"] +
                0.18 * feature_data["previous_semester_percentage"] +
                0.12 * feature_data["assignment_score"] +
                0.08 * (feature_data["attendance_percentage"] * 0.8) +
                0.08 * (feature_data["assignment_completion_percentage"] * 0.7) +
                0.05 * (feature_data["learning_activity_score"] * 0.6) +
                (feature_data["study_hours_per_week"] * 0.35)
            )
            rse = 3.5
        else:
            row_df = pd.DataFrame([{col: float(feature_data.get(col, 0.0)) for col in FEATURE_COLUMNS}])
            raw_pred = pipeline.predict(row_df)[0]
            estimated = float(raw_pred)
            rse = float(self.metadata.get("residual_standard_error", 3.37))

        estimated_clamped = max(0.0, min(100.0, round(estimated, 1)))

        # Compute empirical 90% prediction confidence interval (+/- 1.645 * RSE)
        lower_bound = max(0.0, round(estimated_clamped - (1.645 * rse), 1))
        upper_bound = min(100.0, round(estimated_clamped + (1.645 * rse), 1))

        # Categorize
        if estimated_clamped >= 80.0:
            category = "Distinction"
            support_priority = "Good Standing"
        elif estimated_clamped >= 60.0:
            category = "First Class"
            support_priority = "Good Standing"
        elif estimated_clamped >= 45.0:
            category = "Pass / Average"
            support_priority = "Moderate Monitoring"
        else:
            category = "Needs Support"
            support_priority = "High Academic Priority"

        # Feature impact explanations
        importances = self.metadata.get("feature_importances", {})
        feature_impacts = []
        for col in FEATURE_COLUMNS:
            val = float(feature_data.get(col, 0.0))
            baseline = FEATURE_BASELINES.get(col, 50.0)
            weight = importances.get(col, 0.1)

            diff = val - baseline
            if diff > 5.0:
                impact = "positive"
                note = f"Above class average baseline ({baseline:.1f}). Contributes positively to estimated performance."
            elif diff < -5.0:
                impact = "negative"
                note = f"Below class average baseline ({baseline:.1f}). Areas below average reduce the overall estimate."
            else:
                impact = "neutral"
                note = f"In line with expected cohort baseline ({baseline:.1f})."

            feature_impacts.append({
                "feature": col,
                "label": FEATURE_LABELS.get(col, col),
                "value": round(val, 1),
                "importance_weight": round(weight, 4),
                "impact": impact,
                "insight_note": note
            })

        # Sort feature impacts by importance weight descending
        feature_impacts.sort(key=lambda x: x["importance_weight"], reverse=True)

        recommendations = generate_academic_recommendations(feature_data, estimated_clamped)
        triggers = evaluate_early_support_triggers(feature_data, estimated_clamped)

        return {
            "estimated_score": estimated_clamped,
            "lower_bound": lower_bound,
            "upper_bound": upper_bound,
            "performance_category": category,
            "support_priority": support_priority,
            "model_name": chosen_model_name,
            "model_version": self.metadata.get("version", "1.0.0"),
            "residual_standard_error": round(rse, 3),
            "disclaimer": (
                "Educational Disclaimer: This estimate is a probabilistic projection computed by machine learning "
                "based on historical academic indicators. It is intended solely for early academic guidance, "
                "personalized mentoring, and continuous improvement. It does not constitute an official examination outcome."
            ),
            "feature_impacts": feature_impacts,
            "recommendations": recommendations,
            "early_support_triggers": triggers
        }

# Global singleton inference engine
ml_service = MLInferenceEngine()
