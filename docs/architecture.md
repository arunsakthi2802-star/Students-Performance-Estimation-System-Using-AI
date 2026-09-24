# System Architecture

## Project Information
- **Project Title:** Students Performance Estimation System Using AI
- **Project Owner:** Nithyasri S
- **Academic Degree Demonstration:** MCA / B.Sc. Computer Science / Information Technology

---

## 1. High-Level Architecture Overview

The system follows a decoupled, three-tier micro-service architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Client Presentation Tier                        │
│   React 19 + TypeScript + Vite + Tailwind CSS v4 + Recharts + Lucide  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON REST APIs (JWT Bearer)
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

## 2. Component Design & Roles

### 2.1 Frontend Tier (Client Application)
- **Framework:** React 19 with TypeScript, bundled using Vite.
- **Styling:** Tailwind CSS v4 with custom educational color tokens and responsive glassmorphism panels.
- **Routing & State:** `react-router-dom` v7 with role-based `ProtectedRoute` guards for Student, Faculty, and Admin personas.
- **Data Visualization:** `recharts` for responsive multi-dimensional continuous assessment charts, performance distribution donuts, and horizontal feature importance plots.
- **Authentication State:** Global React `AuthContext` with JWT storage and automatic Axios request/response interceptors.

### 2.2 Backend Application Tier (FastAPI Service)
- **Framework:** FastAPI running on asynchronous ASGI server Uvicorn.
- **Validation:** Pydantic v2 schemas providing boundary validation (e.g., marks and percentages bounded strictly within `[0.0, 100.0]`).
- **Security:** Salted BCrypt password hashing and PyJWT signed tokens with 7-day expiration.
- **Role-Based Access Control (RBAC):** Hierarchical permission dependencies (`admin`, `teacher`, `student`).
  - Students can only view and simulate their personal records.
  - Faculty can monitor assigned class rosters, enter marks, and add mentoring notes.
  - Administrators maintain system-wide governance, dataset uploads, and model retraining workflows.

### 2.3 Machine Learning Inference Tier
- **Framework:** Python Scikit-Learn pipelines serialized using Joblib.
- **Artifacts Managed:**
  - `student_performance_champion_model.joblib`: Active deployed pipeline with embedded StandardScaler.
  - `model_metadata.json`: Cross-validation scores, RSE, feature importances, and version tags.
- **Explainability:** Compares input values against class baselines to report directional feature attribution (+Positive driver, -Concern, Neutral).
- **Statistical Uncertainty:** Computes a 90% confidence prediction interval using the residual standard error ($\pm 1.645 \times \text{RSE}$).

---

## 3. Data Flow Diagram

1. **User Authentication:** Client posts credentials to `/api/auth/login`. Returns JWT bearer token containing user identity and role.
2. **Student Performance Estimation:**
   - Teacher or Student inputs 8 educational indicators.
   - Client sends payload to `/api/ml/predict`.
   - FastAPI preprocesses data with `StandardScaler` pipeline.
   - Model outputs projected numerical outcome.
   - Prediction interval and explainability features calculated.
   - Result is logged to `prediction_history` table for longitudinal auditing.
   - JSON response rendered in interactive UI.
3. **Dataset Ingestion:**
   - Administrator uploads `.csv` or `.xlsx` spreadsheet.
   - FastAPI parses file in-memory, validates column mappings and bounds, detects duplicates.
   - Returns validation summary & preview to UI.
   - On confirmation, records are ingested into SQLite relational tables.
