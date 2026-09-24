"""
Reports Generation & Data Export API Routes
Students Performance Estimation System Using AI
Project Owner: Nithyasri S
"""

import io
import csv
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.api.auth import get_current_user, require_roles
from backend.app.models.db_models import User, Student, AcademicRecord, PredictionHistory

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/export-csv")
def export_performance_csv(
    department: Optional[str] = None,
    semester: Optional[int] = None,
    current_user: User = Depends(require_roles(["admin", "teacher"])),
    db: Session = Depends(get_db)
):
    query = db.query(AcademicRecord, Student).join(Student, AcademicRecord.student_id == Student.student_id)
    if department:
        query = query.filter(Student.department == department)
    if semester:
        query = query.filter(AcademicRecord.semester == semester)

    results = query.all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Student ID", "Student Name", "Department", "Semester", "Subject Code", "Subject Name",
        "Attendance %", "Internal Marks (100)", "Assignment Score", "Practical Score",
        "Prev Semester %", "Weekly Study Hours", "Assignment Completion %", "Learning Activity Score",
        "Recorded Final Score"
    ])

    for rec, stu in results:
        writer.writerow([
            stu.student_id, stu.name, stu.department, rec.semester, rec.subject_code, rec.subject_name,
            rec.attendance_percentage, rec.internal_marks, rec.assignment_score, rec.practical_score,
            rec.previous_semester_percentage, rec.study_hours_per_week, rec.assignment_completion_percentage,
            rec.learning_activity_score, rec.target_score if rec.target_score is not None else "Pending"
        ])

    csv_data = output.getvalue()
    filename = f"student_performance_report_{department or 'all'}_sem{semester or 'all'}.csv"

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/student/{student_id}/report-card")
def get_student_report_card(
    student_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "student" and current_user.student_id != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You cannot view report cards of other students."
        )

    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found.")

    records = db.query(AcademicRecord).filter(AcademicRecord.student_id == student_id).all()
    predictions = db.query(PredictionHistory).filter(PredictionHistory.student_id == student_id).order_by(PredictionHistory.created_at.desc()).all()

    avg_att = round(sum(r.attendance_percentage for r in records) / len(records), 1) if records else 0.0
    avg_internals = round(sum(r.internal_marks for r in records) / len(records), 1) if records else 0.0

    return {
        "institution": "University Department of Computer Science & Information Technology",
        "system_title": "Students Performance Estimation System Using AI",
        "project_owner": "Nithyasri S",
        "student": {
            "student_id": student.student_id,
            "name": student.name,
            "department": student.department,
            "semester": student.semester,
            "academic_year": student.academic_year,
            "email": student.email
        },
        "academic_summary": {
            "total_courses": len(records),
            "aggregate_attendance": avg_att,
            "aggregate_internal_marks": avg_internals
        },
        "course_breakdown": [
            {
                "subject_code": r.subject_code,
                "subject_name": r.subject_name,
                "attendance_percentage": r.attendance_percentage,
                "internal_marks": r.internal_marks,
                "assignment_score": r.assignment_score,
                "practical_score": r.practical_score,
                "recorded_target_score": r.target_score
            }
            for r in records
        ],
        "ai_estimations": [
            {
                "model_name": p.model_name,
                "estimated_score": p.estimated_score,
                "lower_bound": p.lower_bound,
                "upper_bound": p.upper_bound,
                "performance_category": p.performance_category,
                "support_priority": p.support_priority,
                "created_at": p.created_at
            }
            for p in predictions[:3]
        ]
    }
