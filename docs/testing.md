# Testing and Validation Guide

## Project Information
- **Project Title:** Students Performance Estimation System Using AI
- **Project Owner:** Nithyasri S
- **Academic Degree Demonstration:** MCA / B.Sc. Computer Science / Information Technology

---

## 1. Test Overview

The application features multi-layered automated and integration tests:

1. **Backend & API Tests:** Pytest test suite covering authentication, RBAC authorization, CRUD operations, prediction bounds, and dashboard metrics.
2. **Machine Learning Pipeline Tests:** Cross-validation R², residual standard error bounds, and feature transformation consistency.
3. **Frontend Compilation & Type Validation:** Strict TypeScript type checking and Vite build verification.

---

## 2. Running Backend Tests

Run the Pytest suite from the root project directory:

```bash
python -m pytest backend/tests/test_api.py -v
```

### Verified Test Cases:
- `test_health_check`: Validates API root `/` status and project owner attribution.
- `test_admin_login`: Verifies JWT authentication for `admin@college.edu`.
- `test_teacher_login`: Verifies JWT authentication for `teacher@college.edu`.
- `test_student_login`: Verifies JWT authentication for `student@college.edu` and verifies linked student ID `STU1001`.
- `test_invalid_login`: Ensures unauthorized 401 response on incorrect password.
- `test_ml_prediction_with_valid_input`: Validates that `/api/ml/predict` returns an estimated score bounded within $[0, 100]$, proper prediction intervals, explainability features, and pedagogical recommendations.
- `test_ml_models_list`: Validates active model metadata and benchmark retrieval.
- `test_dashboard_overview`: Confirms aggregation calculations for attendance and internals.

### Test Execution Output:
```
backend/tests/test_api.py ........                                       [100%]
============================== 8 passed in 4.59s ==============================
```

---

## 3. Running Frontend Production Build

Verify frontend compilation and assets generation:

```bash
cd frontend
npm run build
```

Expected Output:
```
vite v8.3.0 building client environment for production...
✓ built in ~770ms
```

---

## 4. Manual End-to-End Validation Checklist

1. **Student Persona Flow:**
   - Sign in as `student@college.edu` / `Student123!`.
   - Verify Student Dashboard displays personal profile of **Nithyasri S (STU1001)**.
   - Inspect continuous assessment graphs and personalized study recommendations.
   - Click "Academic Report Card" to generate official printable statement.
2. **Faculty Persona Flow:**
   - Sign in as `teacher@college.edu` / `Teacher123!`.
   - Access Faculty Dashboard, filter student roster by department or search term.
   - Click "Add Marks" to log continuous assessment scores.
   - Click "Support Note" to log an academic counseling note with action plan.
3. **Administrator Persona Flow:**
   - Sign in as `admin@college.edu` / `Admin123!`.
   - Access Admin Dashboard and trigger "Retrain ML Models".
   - Open Dataset Upload page, upload `sample_student_academic_upload.csv`, review validation preview, and confirm ingestion.
   - Open ML Registry, compare algorithms, and switch active champion model.
