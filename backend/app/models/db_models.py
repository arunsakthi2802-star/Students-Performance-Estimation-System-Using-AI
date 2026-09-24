"""
Database Models Definition
Students Performance Estimation System Using AI
Project Owner: Nithyasri S
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="student")  # 'admin', 'teacher', 'student'
    student_id = Column(String(50), nullable=True, index=True)
    department = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    department = Column(String(100), nullable=False)
    semester = Column(Integer, nullable=False, default=1)
    academic_year = Column(String(50), nullable=False, default="2025-2026")
    status = Column(String(50), default="Active")
    enrolled_date = Column(DateTime, default=utc_now)

    # Relationships
    academic_records = relationship("AcademicRecord", back_populates="student", cascade="all, delete-orphan")
    predictions = relationship("PredictionHistory", back_populates="student", cascade="all, delete-orphan")
    support_notes = relationship("SupportNote", back_populates="student", cascade="all, delete-orphan")

class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    department = Column(String(100), nullable=False)
    designation = Column(String(100), default="Assistant Professor")
    created_at = Column(DateTime, default=utc_now)

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    department = Column(String(100), nullable=False)
    semester = Column(Integer, nullable=False)
    credits = Column(Integer, default=3)

class AcademicRecord(Base):
    __tablename__ = "academic_records"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), ForeignKey("students.student_id"), nullable=False, index=True)
    subject_code = Column(String(50), nullable=False)
    subject_name = Column(String(255), nullable=False)
    semester = Column(Integer, nullable=False)
    
    # Core educational parameters
    attendance_percentage = Column(Float, nullable=False)
    internal_marks = Column(Float, nullable=False)
    assignment_score = Column(Float, nullable=False)
    practical_score = Column(Float, nullable=False)
    previous_semester_percentage = Column(Float, nullable=False)
    study_hours_per_week = Column(Float, nullable=False)
    assignment_completion_percentage = Column(Float, nullable=False)
    learning_activity_score = Column(Float, nullable=False)
    
    # Optional recorded final exam score if completed
    target_score = Column(Float, nullable=True)
    
    recorded_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    student = relationship("Student", back_populates="academic_records")

class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), ForeignKey("students.student_id"), nullable=True, index=True)
    student_name = Column(String(255), nullable=True)
    model_name = Column(String(100), nullable=False)
    estimated_score = Column(Float, nullable=False)
    lower_bound = Column(Float, nullable=False)
    upper_bound = Column(Float, nullable=False)
    performance_category = Column(String(50), nullable=False)
    support_priority = Column(String(50), nullable=False)
    confidence_note = Column(Text, nullable=True)
    feature_inputs_json = Column(Text, nullable=False)
    explanation_notes_json = Column(Text, nullable=False)
    performed_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    student = relationship("Student", back_populates="predictions")

class SupportNote(Base):
    __tablename__ = "support_notes"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), ForeignKey("students.student_id"), nullable=False, index=True)
    teacher_name = Column(String(255), nullable=False)
    priority = Column(String(50), default="Medium")  # 'High', 'Medium', 'Low'
    title = Column(String(255), nullable=False)
    note = Column(Text, nullable=False)
    action_plan = Column(Text, nullable=True)
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

    student = relationship("Student", back_populates="support_notes")

class DatasetUpload(Base):
    __tablename__ = "dataset_uploads"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    row_count = Column(Integer, nullable=False, default=0)
    valid_count = Column(Integer, nullable=False, default=0)
    invalid_count = Column(Integer, nullable=False, default=0)
    status = Column(String(50), default="Processed")
    uploaded_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=utc_now)

class ModelRegistry(Base):
    __tablename__ = "model_registry"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    algorithm = Column(String(100), nullable=False)
    version = Column(String(50), nullable=False, default="1.0.0")
    mae = Column(Float, nullable=False)
    rmse = Column(Float, nullable=False)
    r2_score = Column(Float, nullable=False)
    is_active = Column(Boolean, default=False)
    trained_at = Column(DateTime, default=utc_now)
    metrics_json = Column(Text, nullable=False)
    feature_importances_json = Column(Text, nullable=False)
