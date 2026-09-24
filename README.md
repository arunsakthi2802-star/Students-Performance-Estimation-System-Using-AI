# Students Performance Estimation System Using AI

> **"Understand Academic Progress. Support Better Learning with AI."**

---

### **Project Information**
- **Project Title:** Students Performance Estimation System Using AI
- **Project Owner:** Nithyasri S
- **Academic Context:** MCA / B.Sc. Computer Science & Information Technology Major Academic Project Demonstration
- **Application Category:** Artificial Intelligence + Machine Learning + Full-Stack Web Application + Educational Data Mining

---

## 1. Project Overview

**Students Performance Estimation System Using AI** is an advanced, production-grade educational technology web application. It synthesizes continuous assessment marks, practical laboratory scores, attendance percentages, homework completion, and weekly study habits to project end-semester academic outcomes, detect at-risk students early, and generate actionable pedagogical interventions.

Rather than offering opaque or deterministic scores, the system grounds predictions in statistical regression models with empirical **90% Confidence Prediction Intervals**, explainable feature attribution, early warning triggers, and tailored action plans.

---

## 2. Problem Statement

Educational institutions routinely capture student academic and engagement metrics across disjointed spreadsheets and paper records:
- Continuous Internal Assessment marks
- Assignment quality and submission consistency
- Attendance percentages
- Practical laboratory examination performance
- Previous semester cumulative marks
- Weekly independent study allocations

Faculty face significant manual workload identifying performance patterns early enough in the semester to provide corrective support. This system introduces an automated, explainable Machine Learning pipeline to assist educators in identifying students who may need additional academic resources before final examinations take place.

---

## 3. Key Objectives

1. **Continuous Assessment Tracking:** Centralize multi-dimensional academic indicators across departments.
2. **Supervised Regression Modeling:** Train and evaluate candidate algorithms (Linear Regression, Ridge, Random Forest, Gradient Boosting) to project outcomes with cross-validated metrics.
3. **Transparent Uncertainty Quantification:** Supply confidence intervals based on Residual Standard Error rather than fabricated certainty.
4. **Explainable AI (XAI):** Directionally attribute feature weights relative to class baselines.
5. **Early Warning Safety System:** Flag attendance $<75\%$ and internal marks $<50$ automatically.
6. **Role-Based Portals:** Dedicated, secure interfaces for Administrators, Faculty, and Students.
7. **Institutional Reporting:** Export class spreadsheets (CSV) and format printable student academic grade statements.

---

## 4. System Architecture

The project adopts a modern three-tier architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Client Presentation Tier                        │
│   React 19 + TypeScript + Vite + Tailwind CSS v4 + Recharts + Lucide  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST APIs (Bearer JWT)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       FastAPI Application Tier                         │
│  FastAPI 0.129 + Pydantic v2 + Dependency Injection + Role Guards       │
│  ┌────────────────────────┐  ┌──────────────────────────────────────┐  │
│  │ Auth & RBAC Security   │  │ Academic Assessment Services         │  │
│  └────────────────────────┘  └──────────────────────────────────────┘  │
│  ┌────────────────────────┐  ┌──────────────────────────────────────┐  │
│  │ Dataset Ingestion & QA │  │ Pedagogical Recommendation Engine    │  │
│  └────────────────────────┘  └──────────────────────────────────────┘  │
└───────────────────┬───────────────────────────────────┬────────────────┘
                    │                                   │
                    ▼                                   ▼
┌───────────────────────────────────┐ ┌──────────────────────────────────┐
│        Relational Storage         │ │     ML Inference Engine          │
│ SQLite / PostgreSQL (SQLAlchemy)  │ │ Scikit-Learn Pipelines & Joblib  │
│ Students, Records, Notes, History │ │ Regression Models & Explainers   │
└───────────────────────────────────┘ └──────────────────────────────────┘
```

---

## 5. Technology Stack

### Frontend
- **Core:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4 (with custom educational design tokens and responsive glassmorphism)
- **Icons & Visuals:** Lucide React
- **Data Visualization:** Recharts (Continuous Assessment Bar Charts, Pie Charts, Feature Importance Plots)
- **Routing:** React Router v7 with role-based `ProtectedRoute` guards
- **HTTP Client:** Axios with JWT request interceptors

### Backend
- **Framework:** Python 3.11+ / 3.14 FastAPI
- **Data Modeling & Validation:** Pydantic v2 (Strict ranges $[0.0, 100.0]$)
- **Database & ORM:** SQLAlchemy 2.0 with portable SQLite (zero external setup required; PostgreSQL compatible)
- **Authentication & Security:** Salted BCrypt password hashing, PyJWT signed tokens (HS256)
- **API Documentation:** Interactive OpenAPI / Swagger UI at `/docs`

### Machine Learning & Data Science
- **Libraries:** Scikit-Learn, Pandas, NumPy, Joblib
- **Candidate Models:** Linear Regression, Ridge Regression, Random Forest Regressor, Gradient Boosting Regressor
- **Validation:** 5-Fold Cross-Validation, 80/20 Train-Test split
- **Evaluation Metrics:** Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), $R^2$ Score

---

## 6. Pre-Configured Demonstration Accounts

The database is pre-seeded with sample accounts for instant evaluation:

| Role | Email | Password | Persona Details |
| :--- | :--- | :--- | :--- |
| **Student** | `student@college.edu` | `Student123!` | **Nithyasri S (STU1001)** — Computer Science, Sem 4 |
| **Faculty / Teacher** | `teacher@college.edu` | `Teacher123!` | **Dr. S. Natarajan** — Department Faculty Mentor |
| **Administrator** | `admin@college.edu` | `Admin123!` | **System Administrator** — Institutional Governance |

*Tip: The Login Page also features 1-click Fast Demo Login buttons for instant access.*

---

## 7. Machine Learning Methodology & Benchmarks

The model was trained on **1,200 documented educational records** across 5 academic departments using 8 standardized features:
1. `attendance_percentage`
2. `internal_marks`
3. `assignment_score`
4. `practical_score`
5. `previous_semester_percentage`
6. `study_hours_per_week`
7. `assignment_completion_percentage`
8. `learning_activity_score`

### Benchmark Results Comparison:
| Model Name | MAE (Avg Error) | RMSE | Test $R^2$ Score | 5-Fold CV $R^2$ | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Linear Regression** | **2.696** | **3.374** | **0.9414** | **0.9423 $\pm$ 0.0108** | **Champion Model** |
| **Ridge Regression** | 2.695 | 3.374 | 0.9414 | 0.9423 $\pm$ 0.0108 | Registered |
| **Gradient Boosting** | 2.890 | 3.576 | 0.9342 | 0.9366 $\pm$ 0.0107 | Registered |
| **Random Forest** | 3.057 | 3.792 | 0.9260 | 0.9344 $\pm$ 0.0114 | Registered |

### Relative Feature Weights:
- **Continuous Internal Marks:** 25.4%
- **Weekly Self-Study Time:** 18.4%
- **Practical & Laboratory Marks:** 15.4%
- **Previous Semester Marks:** 14.4%
- **Assignment Quality Score:** 9.9%
- **Classroom Attendance:** 8.3%
- **Assignment Completion Rate:** 5.5%
- **LMS & Quiz Engagement:** 2.7%

---

## 8. Installation & Local Execution

### Prerequisites
- Python 3.11+
- Node.js v18+ and npm

### 1. Backend Setup & Startup
From the project root directory:

```bash
# Optional: create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # On Windows

# Install backend dependencies
pip install -r backend/requirements.txt

# Run initial database migration & seeding
python -m backend.seed_data

# Start FastAPI development server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API is now running at `http://127.0.0.1:8000` with interactive Swagger docs at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup & Startup
In a separate terminal:

```bash
cd frontend

# Install frontend dependencies
npm install

# Start Vite React development server
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 9. Automated Testing

Run the automated backend test suite:

```bash
python -m pytest backend/tests/test_api.py -v
```

All 8 integration tests covering authentication, RBAC authorization, ML inference, and dashboard metrics will execute and pass.

---

## 10. Application Modules Summary

1. **Landing Page:** Interactive hero with live 4-slider estimation preview, feature highlights, and role benefits.
2. **Authentication:** Salted BCrypt password hashing, JWT bearer tokens, and fast 1-click demo logins.
3. **Student Dashboard:** Personalized portal showing enrolled courses, internal marks, attendance alerts, and personalized study tips.
4. **Faculty Dashboard:** Class monitoring, student roster with risk triage, marks entry modal, and counseling notes.
5. **Admin Dashboard:** System analytics, user roles breakdown, dataset ingestion audit, and ML retraining triggers.
6. **Estimation Studio:** 8-factor interactive simulation laboratory with 90% confidence intervals, explainability attribution, and printable summary.
7. **Dataset Upload & Validation:** Ingest departmental `.csv` or `.xlsx` files with automatic column mapping, duplicate detection, and range validation.
8. **ML Model Registry:** Real-time algorithm comparison, feature importance bar charts, and 1-click active champion hot-swapping.
9. **Reports & Export:** Export consolidated class spreadsheets (CSV) and generate official printable student grade statements.

---

## 11. Ethical Considerations & Responsible AI

- **Probabilistic Guidance:** Estimations are data-driven projections intended to identify students who may benefit from early academic support; they do not represent guaranteed examination results or definitive judgments about a student's innate ability.
- **Privacy Conscious:** Strict role-based isolation ensures students can only view their personal records. Sensitive personal details are excluded from model training.
- **Actionable Advice:** Every low estimate triggers constructive, transparent recommendations rather than punitive labels.

---

## 12. Project Ownership & Attribution

- **Project Owner:** **Nithyasri S**
- **Developed for:** MCA / B.Sc. Computer Science / Information Technology Project Demonstration
- **Year:** 2026
