"""
Comprehensive Backend & ML API Test Suite
Students Performance Estimation System Using AI
Project Owner: Nithyasri S
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "Nithyasri S" in data["project_owner"]

def test_admin_login():
    response = client.post("/api/auth/login", json={
        "email": "admin@college.edu",
        "password": "Admin123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"

def test_teacher_login():
    response = client.post("/api/auth/login", json={
        "email": "teacher@college.edu",
        "password": "Teacher123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "teacher"

def test_student_login():
    response = client.post("/api/auth/login", json={
        "email": "student@college.edu",
        "password": "Student123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "student"
    assert data["user"]["student_id"] == "STU1001"

def test_invalid_login():
    response = client.post("/api/auth/login", json={
        "email": "nonexistent@college.edu",
        "password": "WrongPassword123"
    })
    assert response.status_code == 401

def test_ml_prediction_with_valid_input():
    # Login first
    login_res = client.post("/api/auth/login", json={
        "email": "teacher@college.edu",
        "password": "Teacher123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "student_id": "STU1001",
        "attendance_percentage": 92.5,
        "internal_marks": 88.0,
        "assignment_score": 90.0,
        "practical_score": 92.0,
        "previous_semester_percentage": 86.0,
        "study_hours_per_week": 22.0,
        "assignment_completion_percentage": 95.0,
        "learning_activity_score": 90.0
    }

    pred_res = client.post("/api/ml/predict", json=payload, headers=headers)
    assert pred_res.status_code == 200
    pred = pred_res.json()
    assert "estimated_score" in pred
    assert 0 <= pred["estimated_score"] <= 100
    assert pred["lower_bound"] <= pred["estimated_score"] <= pred["upper_bound"]
    assert "feature_impacts" in pred
    assert len(pred["feature_impacts"]) == 8
    assert "recommendations" in pred
    assert "disclaimer" in pred

def test_ml_models_list():
    login_res = client.post("/api/auth/login", json={
        "email": "admin@college.edu",
        "password": "Admin123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/ml/models", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "active_model" in data
    assert "benchmarks" in data
    assert len(data["benchmarks"]) >= 1

def test_dashboard_overview():
    login_res = client.post("/api/auth/login", json={
        "email": "teacher@college.edu",
        "password": "Teacher123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/dashboard/overview", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "metrics" in data
    assert data["metrics"]["total_students"] >= 1
    assert "performance_distribution" in data

def test_mongodb_list_collections():
    login_res = client.post("/api/auth/login", json={
        "email": "admin@college.edu",
        "password": "Admin123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/mongo/collections", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "collections" in data
    assert len(data["collections"]) >= 5

def test_mongodb_create_read_update_delete_crud():
    login_res = client.post("/api/auth/login", json={
        "email": "admin@college.edu",
        "password": "Admin123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. CREATE document
    create_res = client.post(
        "/api/mongo/students",
        json={"data": {"student_id": "STU_TEST", "name": "Pytest Mongo Student", "department": "Computer Science", "semester": 4}},
        headers=headers
    )
    assert create_res.status_code == 201
    created_doc = create_res.json()["document"]
    doc_id = created_doc["id"]

    # 2. READ document
    read_res = client.get(f"/api/mongo/students/{doc_id}", headers=headers)
    assert read_res.status_code == 200
    assert read_res.json()["student_id"] == "STU_TEST"

    # 3. UPDATE document
    update_res = client.put(
        f"/api/mongo/students/{doc_id}",
        json={"data": {"status": "Verified Active"}},
        headers=headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["document"]["status"] == "Verified Active"

    # 4. DELETE document
    delete_res = client.delete(f"/api/mongo/students/{doc_id}", headers=headers)
    assert delete_res.status_code == 200
    assert delete_res.json()["deleted"] is True
