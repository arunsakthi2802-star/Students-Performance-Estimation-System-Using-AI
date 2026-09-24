"""
Database Seeding Script
Students Performance Estimation System Using AI
Project Owner: Nithyasri S
"""

import json
import os
import random
from backend.app.core.database import engine, SessionLocal, Base
from backend.app.core.security import get_password_hash
from backend.app.models.db_models import (
    User, Student, Teacher, Subject, AcademicRecord, PredictionHistory, SupportNote, ModelRegistry
)

def seed_all():
    print("Creating database tables if not exist...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Default Users
        if db.query(User).count() == 0:
            print("Seeding initial users...")
            users = [
                User(
                    email="admin@college.edu",
                    hashed_password=get_password_hash("Admin123!"),
                    full_name="System Administrator",
                    role="admin",
                    department="Information Technology"
                ),
                User(
                    email="teacher@college.edu",
                    hashed_password=get_password_hash("Teacher123!"),
                    full_name="Dr. S. Natarajan",
                    role="teacher",
                    department="Computer Science"
                ),
                User(
                    email="student@college.edu",
                    hashed_password=get_password_hash("Student123!"),
                    full_name="Nithyasri S",
                    role="student",
                    student_id="STU1001",
                    department="Computer Science"
                )
            ]
            db.add_all(users)
            db.commit()

        # 2. Seed Model Registry if empty
        if db.query(ModelRegistry).count() == 0:
            print("Seeding Model Registry from metadata...")
            meta_path = os.path.join(os.path.dirname(__file__), "app", "ml", "artifacts", "model_metadata.json")
            if os.path.exists(meta_path):
                with open(meta_path, "r") as f:
                    meta = json.load(f)
                
                champ = meta.get("champion_model", "Linear Regression")
                for name, metrics in meta.get("all_model_benchmarks", {}).items():
                    reg = ModelRegistry(
                        name=name,
                        algorithm=name,
                        version=meta.get("version", "1.0.0"),
                        mae=metrics.get("mae", 0.0),
                        rmse=metrics.get("rmse", 0.0),
                        r2_score=metrics.get("r2_score", 0.0),
                        is_active=(name == champ),
                        metrics_json=json.dumps(metrics),
                        feature_importances_json=json.dumps(meta.get("feature_importances", {}))
                    )
                    db.add(reg)
                db.commit()

        # 3. Seed Students
        if db.query(Student).count() == 0:
            print("Seeding students and rich academic records...")
            # First add Nithyasri S as primary featured student STU1001
            primary_student = Student(
                student_id="STU1001",
                name="Nithyasri S",
                email="student@college.edu",
                department="Computer Science",
                semester=4,
                academic_year="2025-2026",
                status="Active"
            )
            db.add(primary_student)

            student_names = [
                ("Aarav Sundaram", "Computer Science", 4),
                ("Aditi Krishnan", "Information Technology", 4),
                ("Bhavya Ramesh", "Software Engineering", 4),
                ("Deepak Sharma", "Artificial Intelligence & Data Science", 4),
                ("Divya Balaji", "Computer Science", 4),
                ("Ganesh Murugan", "Information Technology", 4),
                ("Harini Venkatesh", "Computer Science", 4),
                ("Ishaan Reddy", "Software Engineering", 4),
                ("Kavya Iyer", "Artificial Intelligence & Data Science", 4),
                ("Madhav Pillai", "Computer Applications", 4),
                ("Meera Gopal", "Information Technology", 4),
                ("Naveen Subramanian", "Computer Science", 4),
                ("Pooja Menon", "Software Engineering", 4),
                ("Rahul Chopra", "Artificial Intelligence & Data Science", 4),
                ("Rhea Devi", "Computer Applications", 4),
                ("Rohit Rao", "Information Technology", 4),
                ("Sai Ramachandran", "Computer Science", 4),
                ("Sneha Patel", "Software Engineering", 4),
                ("Surya Kumar", "Artificial Intelligence & Data Science", 4),
                ("Varun Natarajan", "Computer Applications", 4)
            ]

            all_students = [primary_student]
            for idx, (name, dept, sem) in enumerate(student_names, start=1002):
                sid = f"STU{idx}"
                s = Student(
                    student_id=sid,
                    name=name,
                    email=f"{sid.lower()}@college.edu",
                    department=dept,
                    semester=sem,
                    academic_year="2025-2026",
                    status="Active"
                )
                db.add(s)
                all_students.append(s)

            db.commit()

            # 4. Seed Academic Records for each student
            subjects = [
                ("CS401", "Design and Analysis of Algorithms"),
                ("CS402", "Database Management Systems"),
                ("CS403", "Machine Learning & AI Foundations"),
                ("CS404", "Computer Networks & Security"),
                ("CS405", "Advanced Web Application Development")
            ]

            for s in all_students:
                # Give STU1001 (Nithyasri S) top tier distinction record
                is_featured = (s.student_id == "STU1001")

                for code, sname in subjects:
                    if is_featured:
                        att = round(random.uniform(92.0, 98.5), 1)
                        internals = round(random.uniform(88.0, 96.0), 1)
                        assignments = round(random.uniform(90.0, 98.0), 1)
                        practicals = round(random.uniform(92.0, 97.0), 1)
                        prev_sem = 89.5
                        study_hrs = 24.0
                        completion = 98.0
                        activity = 94.0
                        final_target = round(random.uniform(90.0, 96.0), 1)
                    else:
                        att = round(random.uniform(60.0, 95.0), 1)
                        internals = round(random.uniform(45.0, 90.0), 1)
                        assignments = round(random.uniform(50.0, 92.0), 1)
                        practicals = round(random.uniform(52.0, 92.0), 1)
                        prev_sem = round(random.uniform(50.0, 88.0), 1)
                        study_hrs = round(random.uniform(8.0, 26.0), 1)
                        completion = round(random.uniform(55.0, 95.0), 1)
                        activity = round(random.uniform(45.0, 90.0), 1)
                        final_target = round((internals * 0.4 + assignments * 0.2 + practicals * 0.4) + random.uniform(-3, 3), 1)

                    rec = AcademicRecord(
                        student_id=s.student_id,
                        subject_code=code,
                        subject_name=sname,
                        semester=4,
                        attendance_percentage=att,
                        internal_marks=internals,
                        assignment_score=assignments,
                        practical_score=practicals,
                        previous_semester_percentage=prev_sem,
                        study_hours_per_week=study_hrs,
                        assignment_completion_percentage=completion,
                        learning_activity_score=activity,
                        target_score=final_target,
                        recorded_by="Dr. S. Natarajan"
                    )
                    db.add(rec)

            db.commit()

            # 5. Seed Support Notes
            notes = [
                SupportNote(
                    student_id="STU1005",  # Deepak Sharma
                    teacher_name="Dr. S. Natarajan",
                    priority="High",
                    title="Attendance Remediation & Internal Retest",
                    note="Student has missed consecutive practical sessions. Attendance is currently at 58.5%.",
                    action_plan="Scheduled 1-on-1 counseling on Friday. Assigned peer-tutor for Lab experiments.",
                    resolved=False
                ),
                SupportNote(
                    student_id="STU1010",  # Kavya Iyer
                    teacher_name="Dr. S. Natarajan",
                    priority="High",
                    title="Continuous Assessment Support in Algorithms",
                    note="Scored 38/100 in Internal Exam 1. Struggling with recursion and dynamic programming.",
                    action_plan="Enrolled in remedial Saturday workshop. Provided simplified algorithm problem sheets.",
                    resolved=False
                ),
                SupportNote(
                    student_id="STU1001",  # Nithyasri S
                    teacher_name="Dr. S. Natarajan",
                    priority="Good Standing",
                    title="Department Honor Roll & Symposium Mentorship",
                    note="Demonstrates exceptional consistency and peer leadership in Web Application and AI labs.",
                    action_plan="Nominated for Inter-University Technical Paper Presentation.",
                    resolved=True
                )
            ]
            db.add_all(notes)

            # 6. Seed Sample Predictions
            preds = [
                PredictionHistory(
                    student_id="STU1001",
                    student_name="Nithyasri S",
                    model_name="Linear Regression",
                    estimated_score=93.4,
                    lower_bound=87.9,
                    upper_bound=98.9,
                    performance_category="Distinction",
                    support_priority="Good Standing",
                    confidence_note="Residual standard error: ±3.37",
                    feature_inputs_json=json.dumps({
                        "attendance_percentage": 95.0,
                        "internal_marks": 92.0,
                        "assignment_score": 94.0,
                        "practical_score": 95.0,
                        "previous_semester_percentage": 89.5,
                        "study_hours_per_week": 24.0,
                        "assignment_completion_percentage": 98.0,
                        "learning_activity_score": 94.0
                    }),
                    explanation_notes_json=json.dumps({
                        "summary": "Outstanding profile across all evaluative metrics.",
                        "strengths": ["Continuous internal marks", "High practical laboratory execution"]
                    }),
                    performed_by="Dr. S. Natarajan"
                ),
                PredictionHistory(
                    student_id="STU1005",
                    student_name="Deepak Sharma",
                    model_name="Linear Regression",
                    estimated_score=44.2,
                    lower_bound=38.7,
                    upper_bound=49.7,
                    performance_category="Needs Support",
                    support_priority="High Academic Priority",
                    confidence_note="Residual standard error: ±3.37",
                    feature_inputs_json=json.dumps({
                        "attendance_percentage": 58.5,
                        "internal_marks": 42.0,
                        "assignment_score": 50.0,
                        "practical_score": 48.0,
                        "previous_semester_percentage": 45.0,
                        "study_hours_per_week": 8.0,
                        "assignment_completion_percentage": 56.0,
                        "learning_activity_score": 40.0
                    }),
                    explanation_notes_json=json.dumps({
                        "summary": "Low attendance and low continuous internal marks pull down the estimated final result.",
                        "concerns": ["Attendance below 65%", "Internal mark below 50"]
                    }),
                    performed_by="Dr. S. Natarajan"
                )
            ]
            db.add_all(preds)

            db.commit()
            print("Seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_all()
