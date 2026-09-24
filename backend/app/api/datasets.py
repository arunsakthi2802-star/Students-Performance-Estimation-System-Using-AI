"""
Dataset Upload, Validation & Ingestion API Routes
Students Performance Estimation System Using AI
Project Owner: Nithyasri S
"""

import io
import csv
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.api.auth import get_current_user, require_roles
from backend.app.models.db_models import User, Student, AcademicRecord, DatasetUpload
from backend.app.schemas.api_schemas import DatasetUploadOut

router = APIRouter(prefix="/datasets", tags=["Datasets"])

REQUIRED_COLUMNS = [
    "student_id",
    "attendance_percentage",
    "internal_marks",
    "assignment_score",
    "practical_score",
    "previous_semester_percentage",
    "study_hours_per_week",
    "assignment_completion_percentage",
    "learning_activity_score"
]

@router.post("/validate-preview")
async def preview_and_validate_dataset(
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles(["admin", "teacher"]))
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload a valid .csv file."
        )

    contents = await file.read()
    try:
        text_stream = io.StringIO(contents.decode("utf-8-sig"))
        reader = list(csv.DictReader(text_stream))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

    if not reader:
        return {
            "filename": file.filename,
            "total_rows": 0,
            "valid_rows": 0,
            "invalid_rows": 0,
            "duplicate_count": 0,
            "missing_columns": REQUIRED_COLUMNS,
            "columns_found": [],
            "validation_issues": ["CSV file is empty."],
            "is_valid": False,
            "preview_data": []
        }

    columns_found = list(reader[0].keys())
    missing_cols = [c for c in REQUIRED_COLUMNS if c not in columns_found]

    issues = []
    if missing_cols:
        issues.append(f"Missing mandatory columns: {', '.join(missing_cols)}")

    seen_ids = set()
    duplicate_count = 0
    invalid_rows = 0

    for row in reader:
        sid = row.get("student_id", "").strip()
        if sid:
            if sid in seen_ids:
                duplicate_count += 1
            else:
                seen_ids.add(sid)

        try:
            att = float(row.get("attendance_percentage", 0))
            marks = float(row.get("internal_marks", 0))
            if att < 0 or att > 100 or marks < 0 or marks > 100:
                invalid_rows += 1
        except ValueError:
            invalid_rows += 1

    total_rows = len(reader)
    valid_rows = max(0, total_rows - duplicate_count - invalid_rows)
    preview_records = reader[:10]

    return {
        "filename": file.filename,
        "total_rows": total_rows,
        "valid_rows": valid_rows,
        "invalid_rows": total_rows - valid_rows,
        "duplicate_count": duplicate_count,
        "missing_columns": missing_cols,
        "columns_found": columns_found,
        "validation_issues": issues,
        "is_valid": len(missing_cols) == 0 and invalid_rows == 0,
        "preview_data": preview_records
    }

@router.post("/import")
async def import_dataset(
    file: UploadFile = File(...),
    subject_code: str = Form("CS401"),
    subject_name: str = Form("Database & Analytics Systems"),
    semester: int = Form(4),
    current_user: User = Depends(require_roles(["admin", "teacher"])),
    db: Session = Depends(get_db)
):
    contents = await file.read()
    try:
        text_stream = io.StringIO(contents.decode("utf-8-sig"))
        reader = list(csv.DictReader(text_stream))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read CSV file: {str(e)}")

    if not reader:
        raise HTTPException(status_code=400, detail="CSV file is empty.")

    columns_found = list(reader[0].keys())
    missing_cols = [c for c in REQUIRED_COLUMNS if c not in columns_found]
    if missing_cols:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot import: File is missing required columns: {', '.join(missing_cols)}"
        )

    imported_count = 0
    for row in reader:
        sid = str(row.get("student_id", "")).strip()
        if not sid:
            continue

        stu = db.query(Student).filter(Student.student_id == sid).first()
        if not stu:
            stu_name = str(row.get("name", f"Student {sid}")).strip()
            dept = str(row.get("department", "Computer Science")).strip()
            stu = Student(
                student_id=sid,
                name=stu_name,
                email=f"{sid.lower()}@college.edu",
                department=dept,
                semester=int(row.get("semester", semester))
            )
            db.add(stu)
            db.flush()

        rec = db.query(AcademicRecord).filter(
            AcademicRecord.student_id == sid,
            AcademicRecord.subject_code == subject_code,
            AcademicRecord.semester == semester
        ).first()

        target_score = float(row["final_score"]) if row.get("final_score") else None

        if not rec:
            rec = AcademicRecord(
                student_id=sid,
                subject_code=subject_code,
                subject_name=subject_name,
                semester=semester,
                attendance_percentage=float(row["attendance_percentage"]),
                internal_marks=float(row["internal_marks"]),
                assignment_score=float(row["assignment_score"]),
                practical_score=float(row["practical_score"]),
                previous_semester_percentage=float(row["previous_semester_percentage"]),
                study_hours_per_week=float(row["study_hours_per_week"]),
                assignment_completion_percentage=float(row["assignment_completion_percentage"]),
                learning_activity_score=float(row["learning_activity_score"]),
                target_score=target_score,
                recorded_by=current_user.full_name
            )
            db.add(rec)
        else:
            rec.attendance_percentage = float(row["attendance_percentage"])
            rec.internal_marks = float(row["internal_marks"])
            rec.assignment_score = float(row["assignment_score"])
            rec.practical_score = float(row["practical_score"])
            rec.previous_semester_percentage = float(row["previous_semester_percentage"])
            rec.study_hours_per_week = float(row["study_hours_per_week"])
            rec.assignment_completion_percentage = float(row["assignment_completion_percentage"])
            rec.learning_activity_score = float(row["learning_activity_score"])
            rec.target_score = target_score
            rec.recorded_by = current_user.full_name

        imported_count += 1

    upload_record = DatasetUpload(
        filename=file.filename,
        row_count=len(reader),
        valid_count=imported_count,
        invalid_count=len(reader) - imported_count,
        status="Successfully Ingested",
        uploaded_by=current_user.full_name
    )
    db.add(upload_record)
    db.commit()

    return {
        "message": f"Successfully imported {imported_count} academic records.",
        "imported_count": imported_count,
        "filename": file.filename
    }

@router.get("/uploads", response_model=list[DatasetUploadOut])
def list_dataset_uploads(
    current_user: User = Depends(require_roles(["admin", "teacher"])),
    db: Session = Depends(get_db)
):
    return db.query(DatasetUpload).order_by(DatasetUpload.created_at.desc()).limit(20).all()
