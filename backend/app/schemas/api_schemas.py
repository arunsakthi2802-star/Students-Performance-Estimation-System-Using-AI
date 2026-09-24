"""
Pydantic API Request and Response Schemas
Students Performance Estimation System Using AI
Project Owner: Nithyasri S
"""

from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field, EmailStr, ConfigDict

# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    full_name: str = Field(..., min_length=2)
    role: str = Field("student", description="Role: admin, teacher, student")
    student_id: Optional[str] = None
    department: Optional[str] = "Computer Science"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict[str, Any]

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    student_id: Optional[str]
    department: Optional[str]
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Student Schemas
class StudentBase(BaseModel):
    student_id: str
    name: str
    email: EmailStr
    department: str
    semester: int = Field(..., ge=1, le=8)
    academic_year: str = "2025-2026"
    status: str = "Active"

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None
    semester: Optional[int] = Field(None, ge=1, le=8)
    academic_year: Optional[str] = None
    status: Optional[str] = None

class StudentOut(StudentBase):
    id: int
    enrolled_date: datetime

    model_config = ConfigDict(from_attributes=True)

# Academic Record Schemas
class AcademicRecordBase(BaseModel):
    student_id: str
    subject_code: str
    subject_name: str
    semester: int = Field(..., ge=1, le=8)
    attendance_percentage: float = Field(..., ge=0.0, le=100.0)
    internal_marks: float = Field(..., ge=0.0, le=100.0)
    assignment_score: float = Field(..., ge=0.0, le=100.0)
    practical_score: float = Field(..., ge=0.0, le=100.0)
    previous_semester_percentage: float = Field(..., ge=0.0, le=100.0)
    study_hours_per_week: float = Field(..., ge=0.0, le=80.0)
    assignment_completion_percentage: float = Field(..., ge=0.0, le=100.0)
    learning_activity_score: float = Field(..., ge=0.0, le=100.0)
    target_score: Optional[float] = Field(None, ge=0.0, le=100.0)

class AcademicRecordCreate(AcademicRecordBase):
    pass

class AcademicRecordOut(AcademicRecordBase):
    id: int
    recorded_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Estimation & Prediction Schemas
class PredictionRequest(BaseModel):
    student_id: Optional[str] = None
    student_name: Optional[str] = None
    attendance_percentage: float = Field(..., ge=0.0, le=100.0, description="Attendance in %")
    internal_marks: float = Field(..., ge=0.0, le=100.0, description="Continuous Internal Assessment mark")
    assignment_score: float = Field(..., ge=0.0, le=100.0, description="Average assignment mark")
    practical_score: float = Field(..., ge=0.0, le=100.0, description="Practical/laboratory mark")
    previous_semester_percentage: float = Field(..., ge=0.0, le=100.0, description="Past semester aggregate %")
    study_hours_per_week: float = Field(..., ge=0.0, le=80.0, description="Independent study hours per week")
    assignment_completion_percentage: float = Field(..., ge=0.0, le=100.0, description="Rate of homework/assignment submission")
    learning_activity_score: float = Field(..., ge=0.0, le=100.0, description="Quizzes, coding labs & LMS participation")
    model_override: Optional[str] = None

class FeatureImpact(BaseModel):
    feature: str
    label: str
    value: float
    importance_weight: float
    impact: str  # 'positive', 'neutral', 'negative'
    insight_note: str

class RecommendationItem(BaseModel):
    category: str
    title: str
    priority: str  # 'High', 'Medium', 'Good Standing'
    description: str
    action_steps: list[str]

class PredictionResponse(BaseModel):
    estimated_score: float
    lower_bound: float
    upper_bound: float
    performance_category: str  # 'Distinction', 'First Class', 'Pass / Average', 'Needs Support'
    support_priority: str     # 'Good Standing', 'Moderate Monitoring', 'High Academic Priority'
    model_name: str
    model_version: str
    residual_standard_error: float
    disclaimer: str
    feature_impacts: list[FeatureImpact]
    recommendations: list[RecommendationItem]
    early_support_triggers: list[str]

class PredictionHistoryOut(BaseModel):
    id: int
    student_id: Optional[str]
    student_name: Optional[str]
    model_name: str
    estimated_score: float
    lower_bound: float
    upper_bound: float
    performance_category: str
    support_priority: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Support Note Schemas
class SupportNoteCreate(BaseModel):
    student_id: str
    priority: str = "Medium"
    title: str
    note: str
    action_plan: Optional[str] = None

class SupportNoteOut(BaseModel):
    id: int
    student_id: str
    teacher_name: str
    priority: str
    title: str
    note: str
    action_plan: Optional[str]
    resolved: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Model Registry Schemas
class ModelRegistryOut(BaseModel):
    id: int
    name: str
    algorithm: str
    version: str
    mae: float
    rmse: float
    r2_score: float
    is_active: bool
    trained_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Dataset Upload Response
class DatasetUploadOut(BaseModel):
    id: int
    filename: str
    row_count: int
    valid_count: int
    invalid_count: int
    status: str
    uploaded_by: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
