"""
Student Management API Routes
Students Performance Estimation System Using AI
Project Owner: Nithyasri S
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.core.database import get_db
from backend.app.api.auth import get_current_user, require_roles
from backend.app.models.db_models import User, Student, AcademicRecord, PredictionHistory, SupportNote
from backend.app.schemas.api_schemas import (
    StudentOut, StudentCreate, StudentUpdate, SupportNoteCreate, SupportNoteOut
)

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("", response_model=dict)
def get_students(
    search: Optional[str] = None,
    department: Optional[str] = None,
    semester: Optional[int] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_roles(["admin", "teacher"])),
    db: Session = Depends(get_db)
):
    query = db.query(Student)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Student.name.ilike(search_filter),
                Student.student_id.ilike(search_filter),
                Student.email.ilike(search_filter)
            )
        )
    if department:
        query = query.filter(Student.department == department)
    if semester:
        query = query.filter(Student.semester == semester)

    total = query.count()
    students = query.order_by(Student.student_id).offset((page - 1) * limit).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "items": [
            {
                "id": s.id,
                "student_id": s.student_id,
                "name": s.name,
                "email": s.email,
                "department": s.department,
                "semester": s.semester,
                "academic_year": s.academic_year,
                "status": s.status,
                "enrolled_date": s.enrolled_date
            }
            for s in students
        ]
    }

@router.get("/profile/me")
def get_my_student_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "student" or not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current logged in user is not registered as a student."
        )
    student = db.query(Student).filter(Student.student_id == current_user.student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found.")
    
    return _build_full_student_profile(student, db)

@router.get("/{student_id}")
def get_student_by_id(
    student_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Authorization: Students can only view their own record
    if current_user.role == "student" and current_user.student_id != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You can only view your own student academic profile."
        )

    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Student {student_id} not found.")

    return _build_full_student_profile(student, db)

@router.post("", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
def create_student(
    student_in: StudentCreate,
    current_user: User = Depends(require_roles(["admin", "teacher"])),
    db: Session = Depends(get_db)
):
    existing = db.query(Student).filter(Student.student_id == student_in.student_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Student ID {student_in.student_id} already exists."
        )

    student = Student(
        student_id=student_in.student_id,
        name=student_in.name,
        email=student_in.email.lower(),
        department=student_in.department,
        semester=student_in.semester,
        academic_year=student_in.academic_year,
        status=student_in.status
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student

@router.post("/{student_id}/notes", response_model=SupportNoteOut)
def add_student_support_note(
    student_id: str,
    note_in: SupportNoteCreate,
    current_user: User = Depends(require_roles(["admin", "teacher"])),
    db: Session = Depends(get_db)
):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")

    note = SupportNote(
        student_id=student_id,
        teacher_name=current_user.full_name,
        priority=note_in.priority,
        title=note_in.title,
        note=note_in.note,
        action_plan=note_in.action_plan
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note

def _build_full_student_profile(student: Student, db: Session) -> dict:
    records = db.query(AcademicRecord).filter(AcademicRecord.student_id == student.student_id).order_by(AcademicRecord.semester.desc()).all()
    predictions = db.query(PredictionHistory).filter(PredictionHistory.student_id == student.student_id).order_by(PredictionHistory.created_at.desc()).limit(5).all()
    notes = db.query(SupportNote).filter(SupportNote.student_id == student.student_id).order_by(SupportNote.created_at.desc()).all()

    # Aggregate stats
    avg_attendance = round(sum(r.attendance_percentage for r in records) / len(records), 1) if records else 0.0
    avg_internal = round(sum(r.internal_marks for r in records) / len(records), 1) if records else 0.0
    avg_practical = round(sum(r.practical_score for r in records) / len(records), 1) if records else 0.0
    avg_study_hours = round(sum(r.study_hours_per_week for r in records) / len(records), 1) if records else 0.0

    latest_prediction = predictions[0] if predictions else None

    return {
        "student_id": student.student_id,
        "name": student.name,
        "email": student.email,
        "department": student.department,
        "semester": student.semester,
        "academic_year": student.academic_year,
        "status": student.status,
        "enrolled_date": student.enrolled_date,
        "aggregates": {
            "average_attendance": avg_attendance,
            "average_internal_marks": avg_internal,
            "average_practical_marks": avg_practical,
            "average_study_hours": avg_study_hours,
            "total_courses_recorded": len(records)
        },
        "latest_estimate": {
            "estimated_score": latest_prediction.estimated_score,
            "lower_bound": latest_prediction.lower_bound,
            "upper_bound": latest_prediction.upper_bound,
            "performance_category": latest_prediction.performance_category,
            "support_priority": latest_prediction.support_priority,
            "model_name": latest_prediction.model_name,
            "created_at": latest_prediction.created_at
        } if latest_prediction else None,
        "academic_records": [
            {
                "id": r.id,
                "subject_code": r.subject_code,
                "subject_name": r.subject_name,
                "semester": r.semester,
                "attendance_percentage": r.attendance_percentage,
                "internal_marks": r.internal_marks,
                "assignment_score": r.assignment_score,
                "practical_score": r.practical_score,
                "previous_semester_percentage": r.previous_semester_percentage,
                "study_hours_per_week": r.study_hours_per_week,
                "assignment_completion_percentage": r.assignment_completion_percentage,
                "learning_activity_score": r.learning_activity_score,
                "target_score": r.target_score,
                "recorded_by": r.recorded_by,
                "updated_at": r.updated_at
            }
            for r in records
        ],
        "support_notes": [
            {
                "id": n.id,
                "teacher_name": n.teacher_name,
                "priority": n.priority,
                "title": n.title,
                "note": n.note,
                "action_plan": n.action_plan,
                "resolved": n.resolved,
                "created_at": n.created_at
            }
            for n in notes
        ]
    }
