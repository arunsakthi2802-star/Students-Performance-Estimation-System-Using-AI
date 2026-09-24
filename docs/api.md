# REST API Documentation

## Project Information
- **Project Title:** Students Performance Estimation System Using AI
- **Project Owner:** Nithyasri S
- **Academic Degree Demonstration:** MCA / B.Sc. Computer Science / Information Technology
- **Base URL:** `http://localhost:8000/api`
- **Interactive Swagger UI:** `http://localhost:8000/docs`

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 User Login
- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Request Body:**
```json
{
  "email": "teacher@college.edu",
  "password": "Teacher123!"
}
```
- **Response (`200 OK`):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "bearer",
  "user": {
    "id": 2,
    "email": "teacher@college.edu",
    "full_name": "Dr. S. Natarajan",
    "role": "teacher",
    "student_id": null,
    "department": "Computer Science"
  }
}
```

### 1.2 User Registration
- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Request Body:**
```json
{
  "email": "newstudent@college.edu",
  "password": "SecurePassword123!",
  "full_name": "Kavya Iyer",
  "role": "student",
  "student_id": "STU1025",
  "department": "Computer Science"
}
```

### 1.3 Current User Info
- **Method:** `GET`
- **Path:** `/api/auth/me`
- **Header:** `Authorization: Bearer <TOKEN>`

---

## 2. Machine Learning & Prediction Endpoints (`/api/ml`)

### 2.1 Estimate Student Academic Performance
- **Method:** `POST`
- **Path:** `/api/ml/predict`
- **Header:** `Authorization: Bearer <TOKEN>`
- **Request Body:**
```json
{
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
```
- **Response (`200 OK`):**
```json
{
  "estimated_score": 90.2,
  "lower_bound": 84.7,
  "upper_bound": 95.7,
  "performance_category": "Distinction",
  "support_priority": "Good Standing",
  "model_name": "Linear Regression",
  "model_version": "1.0.0",
  "residual_standard_error": 3.374,
  "disclaimer": "Educational Disclaimer: This estimate is a probabilistic projection...",
  "feature_impacts": [
    {
      "feature": "internal_marks",
      "label": "Continuous Internal Assessment",
      "value": 88.0,
      "importance_weight": 0.2544,
      "impact": "positive",
      "insight_note": "Above class average baseline (72.0). Contributes positively."
    }
  ],
  "recommendations": [
    {
      "category": "Excellence & Advanced Learning",
      "title": "Maintain Distinction Momentum & Explore Research Opportunities",
      "priority": "Good Standing",
      "description": "Consistent high performance across all dimensions...",
      "action_steps": ["Participate in technical symposiums and hackathons."]
    }
  ],
  "early_support_triggers": []
}
```

### 2.2 Model Benchmarks
- **Method:** `GET`
- **Path:** `/api/ml/models`
- **Returns:** Candidate models, metrics (MAE, RMSE, R²), active champion model, and feature importances.

### 2.3 Activate Model
- **Method:** `POST`
- **Path:** `/api/ml/models/{model_name}/activate`
- **Role:** Administrator / Faculty

### 2.4 Retrain Models
- **Method:** `POST`
- **Path:** `/api/ml/train`
- **Role:** Administrator

---

## 3. Dataset Upload & Validation Endpoints (`/api/datasets`)

### 3.1 Validate & Preview Spreadsheet
- **Method:** `POST`
- **Path:** `/api/datasets/validate-preview`
- **Form Data:** `file: <.csv or .xlsx>`
- **Returns:** `total_rows`, `valid_rows`, `duplicate_count`, `validation_issues`, `preview_data`.

### 3.2 Ingest Dataset
- **Method:** `POST`
- **Path:** `/api/datasets/import`
- **Form Data:** `file`, `subject_code`, `subject_name`, `semester`.
- **Inserts/Updates:** `students` and `academic_records` tables.

---

## 4. Reports & CSV Export Endpoints (`/api/reports`)

### 4.1 Export Performance CSV
- **Method:** `GET`
- **Path:** `/api/reports/export-csv?department=Computer%20Science&semester=4`
- **Response:** Downloadable CSV spreadsheet file.

### 4.2 Printable Student Grade Card
- **Method:** `GET`
- **Path:** `/api/reports/student/{student_id}/report-card`
- **Response:** Comprehensive structured summary suitable for institutional printing.
