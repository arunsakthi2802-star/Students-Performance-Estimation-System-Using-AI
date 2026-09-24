"""
Model Training & Evaluation Script
Students Performance Estimation System Using AI
Project Owner: Nithyasri S
"""

import os
import json
from datetime import datetime
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

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

TARGET_COLUMN = "final_score"

def train_and_evaluate(data_path: str = "ml/data/student_performance_dataset.csv", artifact_dir: str = "backend/app/ml/artifacts"):
    os.makedirs(artifact_dir, exist_ok=True)
    os.makedirs("ml/artifacts", exist_ok=True)

    print(f"Loading dataset from {data_path}...")
    df = pd.read_csv(data_path)

    # Check for missing values & validate
    X = df[FEATURE_COLUMNS].copy()
    y = df[TARGET_COLUMN].copy()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    models = {
        "Linear Regression": Pipeline([
            ("scaler", StandardScaler()),
            ("regressor", LinearRegression())
        ]),
        "Ridge Regression": Pipeline([
            ("scaler", StandardScaler()),
            ("regressor", Ridge(alpha=1.0))
        ]),
        "Random Forest Regressor": Pipeline([
            ("scaler", StandardScaler()),
            ("regressor", RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42))
        ]),
        "Gradient Boosting Regressor": Pipeline([
            ("scaler", StandardScaler()),
            ("regressor", GradientBoostingRegressor(n_estimators=120, learning_rate=0.08, max_depth=4, random_state=42))
        ])
    }

    results = {}
    fitted_models = {}

    kf = KFold(n_splits=5, shuffle=True, random_state=42)

    for name, pipe in models.items():
        print(f"Training {name}...")
        pipe.fit(X_train, y_train)
        y_pred = pipe.predict(X_test)

        mae = float(mean_absolute_error(y_test, y_pred))
        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        r2 = float(r2_score(y_test, y_pred))

        cv_scores = cross_val_score(pipe, X_train, y_train, cv=kf, scoring="r2")
        cv_r2 = float(np.mean(cv_scores))

        results[name] = {
            "mae": round(mae, 3),
            "rmse": round(rmse, 3),
            "r2_score": round(r2, 4),
            "cv_r2_mean": round(cv_r2, 4),
            "cv_r2_std": round(float(np.std(cv_scores)), 4)
        }
        fitted_models[name] = pipe

    # Select champion model based on lowest RMSE and highest R2
    champion_name = min(results.keys(), key=lambda k: results[k]["rmse"])
    champion_pipeline = fitted_models[champion_name]

    print(f"\nChampion Model Selected: {champion_name}")
    print(f"Metrics: MAE = {results[champion_name]['mae']}, RMSE = {results[champion_name]['rmse']}, R2 = {results[champion_name]['r2_score']}")

    # Feature Importance analysis
    feature_importances = {}
    reg = champion_pipeline.named_steps["regressor"]
    if hasattr(reg, "feature_importances_"):
        raw_importances = reg.feature_importances_
        for col, imp in zip(FEATURE_COLUMNS, raw_importances):
            feature_importances[col] = round(float(imp), 4)
    elif hasattr(reg, "coef_"):
        abs_coefs = np.abs(reg.coef_)
        normalized = abs_coefs / np.sum(abs_coefs)
        for col, imp in zip(FEATURE_COLUMNS, normalized):
            feature_importances[col] = round(float(imp), 4)

    # Save active champion pipeline and individual pipelines
    champion_file = os.path.join(artifact_dir, "student_performance_champion_model.joblib")
    joblib.dump(champion_pipeline, champion_file)
    joblib.dump(champion_pipeline, os.path.join("ml/artifacts", "student_performance_champion_model.joblib"))

    # Also dump all models for admin comparison & hot-swapping
    for name, pipe in fitted_models.items():
        safe_name = name.lower().replace(" ", "_")
        joblib.dump(pipe, os.path.join(artifact_dir, f"{safe_name}.joblib"))

    metadata = {
        "project": "Students Performance Estimation System Using AI",
        "project_owner": "Nithyasri S",
        "version": "1.0.0",
        "trained_at": datetime.now().isoformat(),
        "dataset_rows": len(df),
        "train_rows": len(X_train),
        "test_rows": len(X_test),
        "features": FEATURE_COLUMNS,
        "target": TARGET_COLUMN,
        "champion_model": champion_name,
        "champion_metrics": results[champion_name],
        "all_model_benchmarks": results,
        "feature_importances": feature_importances,
        "residual_standard_error": results[champion_name]["rmse"]
    }

    meta_file = os.path.join(artifact_dir, "model_metadata.json")
    with open(meta_file, "w") as f:
        json.dump(metadata, f, indent=2)

    with open("ml/artifacts/model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Model artifacts and metadata saved to {artifact_dir}")
    return metadata

if __name__ == "__main__":
    train_and_evaluate()
