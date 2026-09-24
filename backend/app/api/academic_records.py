"""
Academic Record Management API Routes
Students Performance Estimation System Using AI
Project Owner: Nithyasri S
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.api.auth import get_current_user, require_roles
from backend.app.models.db_models import User, Student, AcademicRecord
from backend.app.schemas.api_schemas import (
    AcademicRecordCreate, AcademicRecordOut
)

router = APIRouter(prefix="/academic-records", tags=["Academic Records"])

@router.get("", response_model=dict)
def get_academic_records(
    student_id: Optional[str] = None,
    semester: Optional[int] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(AcademicRecord)

    # Authorization filter: Students can only view their own records
    if current_user.role == "student":
        query = query.filter(AcademicRecord.student_id == current_user.student_id)
    elif student_id:
        query = query.filter(AcademicRecord.student_id == student_id)

    if semester:
        query = query.filter(AcademicRecord.semester == semester)

    total = query.count()
    records = query.order_by(AcademicRecord.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": records
    }

@router.post("", response_model=AcademicRecordOut, status_code=status.HTTP_201_CREATED)
def create_academic_record(
    record_in: AcademicRecordCreate,
    current_user: User = Depends(require_roles(["admin", "teacher"])),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.student_id == record_in.student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID '{record_in.student_id}' does not exist. Please register the student first."
        )

    # Validate logical boundaries
    if record_in.attendance_percentage < 0 or record_in.attendance_percentage > 100:
        raise HTTPException(status_code=400, detail="Attendance must be between 0 and 100%.")

    record = AcademicRecord(
        student_id=record_in.student_id,
        subject_code=record_in.subject_code.upper(),
        subject_name=record_in.subject_name,
        semester=record_in.semester,
        attendance_percentage=record_in.attendance_percentage,
        internal_marks=record_in.internal_marks,
        assignment_score=record_in.assignment_score,
        practical_score=record_in.practical_score,
        previous_semester_percentage=record_in.previous_semester_percentage,
        study_hours_per_week=record_in.study_hours_per_week,
        assignment_completion_percentage=record_in.assignment_completion_percentage,
        learning_activity_score=record_in.learning_activity_score,
        target_score=record_in.target_score,
        recorded_by=current_user.full_name
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.put("/{record_id}", response_model=AcademicRecordOut)
def update_academic_record(
    record_id: int,
    record_in: AcademicRecordCreate,
    current_user: User = Depends(require_roles(["admin", "teacher"])),
    db: Session = Depends(get_db)
):
    record = db.query(AcademicRecord).filter(AcademicRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Academic record not found.")

    for field, val in record_in.model_dump().items():
        setattr(record, field, val)

    record.recorded_by = current_user.full_name
    db.commit()
    db.refresh(record)
    return record

@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_academic_record(
    record_id: int,
    current_user: User = Depends(require_roles(["admin", "teacher"])),
    db: Session = Depends(get_db)
):
    record = db.query(AcademicRecord).filter(AcademicRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Academic record not found.")

    db.delete(record)
    db.commit()
    return None
