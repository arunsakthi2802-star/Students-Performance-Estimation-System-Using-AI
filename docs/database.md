# Database Design & Entity Relationships

## Project Information
- **Project Title:** Students Performance Estimation System Using AI
- **Project Owner:** Nithyasri S
- **Academic Degree Demonstration:** MCA / B.Sc. Computer Science / Information Technology

---

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o| STUDENTS : "maps to (student role)"
    USERS ||--o| TEACHERS : "maps to (teacher role)"
    STUDENTS ||--o{ ACADEMIC_RECORDS : "has"
    STUDENTS ||--o{ PREDICTION_HISTORY : "evaluated in"
    STUDENTS ||--o{ SUPPORT_NOTES : "receives"
    TEACHERS ||--o{ SUPPORT_NOTES : "authors"
    SUBJECTS ||--o{ ACADEMIC_RECORDS : "associated with"

    USERS {
        int id PK
        string email UK
        string hashed_password
        string full_name
        string role
        string student_id
        string department
        boolean is_active
        datetime created_at
    }

    STUDENTS {
        int id PK
        string student_id UK
        string name
        string email UK
        string department
        int semester
        string academic_year
        string status
        datetime enrolled_date
    }

    TEACHERS {
        int id PK
        string teacher_id UK
        string name
        string email UK
        string department
        string designation
        datetime created_at
    }

    SUBJECTS {
        int id PK
        string code UK
        string name
        string department
        int semester
        int credits
    }

    ACADEMIC_RECORDS {
        int id PK
        string student_id FK
        string subject_code
        string subject_name
        int semester
        float attendance_percentage
        float internal_marks
        float assignment_score
        float practical_score
        float previous_semester_percentage
        float study_hours_per_week
        float assignment_completion_percentage
        float learning_activity_score
        float target_score
        string recorded_by
        datetime created_at
        datetime updated_at
    }

    PREDICTION_HISTORY {
        int id PK
        string student_id FK
        string student_name
        string model_name
        float estimated_score
        float lower_bound
        float upper_bound
        string performance_category
        string support_priority
        string confidence_note
        text feature_inputs_json
        text explanation_notes_json
        string performed_by
        datetime created_at
    }

    SUPPORT_NOTES {
        int id PK
        string student_id FK
        string teacher_name
        string priority
        string title
        text note
        text action_plan
        boolean resolved
        datetime created_at
    }

    DATASET_UPLOADS {
        int id PK
        string filename
        int row_count
        int valid_count
        int invalid_count
        string status
        string uploaded_by
        datetime created_at
    }

    MODEL_REGISTRY {
        int id PK
        string name UK
        string algorithm
        string version
        float mae
        float rmse
        float r2_score
        boolean is_active
        datetime trained_at
        text metrics_json
        text feature_importances_json
    }
```

---

## 2. Table Schemas & Constraints

### 2.1 `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | PK, Auto Increment | User internal ID |
| `email` | String(255) | Unique, Index, Not Null | Login identifier |
| `hashed_password` | String(255) | Not Null | Salted BCrypt password hash |
| `full_name` | String(255) | Not Null | Display name |
| `role` | String(50) | Not Null | `'admin'`, `'teacher'`, `'student'` |
| `student_id` | String(50) | Nullable, Index | Linked student registration ID |
| `department` | String(100) | Nullable | Academic department |

### 2.2 `students`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | PK, Auto Increment | Student internal ID |
| `student_id` | String(50) | Unique, Index, Not Null | Official university roll number (e.g., STU1001) |
| `name` | String(255) | Not Null | Full legal student name |
| `email` | String(255) | Unique, Index, Not Null | Institutional email |
| `department` | String(100) | Not Null | Department / Degree program |
| `semester` | Integer | Not Null | Current semester (1 to 8) |
| `academic_year` | String(50) | Not Null | Academic calendar period |

### 2.3 `academic_records`
Continuous multi-dimensional evaluation parameters recorded per subject:
- `attendance_percentage`: Classroom presence [0.0, 100.0]
- `internal_marks`: Continuous assessment marks [0.0, 100.0]
- `assignment_score`: Homework quality [0.0, 100.0]
- `practical_score`: Laboratory performance [0.0, 100.0]
- `study_hours_per_week`: Weekly self-study hours [0.0, 80.0]
- `target_score`: Recorded final semester exam score (if completed)
