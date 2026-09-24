"""
MongoDB Atlas Seeding & CRUD Operations Verification Script
Students Performance Estimation System Using AI
Project Owner: Nithyasri S
"""

import sys
import os
import json
from datetime import datetime, timezone
from pymongo import ASCENDING, DESCENDING

# Add parent directory to path so script can run directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.core.mongodb import MongoDBManager, MongoCRUD, serialize_mongo_doc
from backend.app.core.security import get_password_hash

def seed_mongodb_database():
    print("=" * 70)
    print("Connecting to MongoDB Atlas...")
    print(f"Database Target: student_performance_ai")
    print("=" * 70)

    db = MongoDBManager.get_database()
    print(f"Connected successfully to cluster! Initializing collections & indexes...")

    # 1. Create Collections with Unique & Compound Indexes
    collections_to_init = [
        ("students", [("student_id", ASCENDING), ("email", ASCENDING), ("department", ASCENDING)]),
        ("academic_records", [("student_id", ASCENDING), ("subject_code", ASCENDING), ("semester", ASCENDING)]),
        ("predictions", [("student_id", ASCENDING), ("created_at", DESCENDING)]),
        ("support_notes", [("student_id", ASCENDING), ("priority", ASCENDING)]),
        ("model_registry", [("name", ASCENDING)]),
        ("users", [("email", ASCENDING), ("role", ASCENDING)]),
        ("audit_logs", [("timestamp", DESCENDING)])
    ]

    for coll_name, index_fields in collections_to_init:
        MongoCRUD.create_collection(coll_name, index_fields)
        print(f"  [OK] Collection created & indexed: '{coll_name}'")

    # Clear existing documents to ensure clean seed
    for coll_name, _ in collections_to_init:
        db[coll_name].delete_many({})

    print("\nPopulating Collections with Validated Student Assessment Records...")

    # 2. Seed Users Collection
    users_data = [
        {
            "email": "student@college.edu",
            "hashed_password": get_password_hash("Student123!"),
            "full_name": "Nithyasri S",
            "role": "student",
            "student_id": "STU1001",
            "department": "Computer Science",
            "is_active": True,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "email": "teacher@college.edu",
            "hashed_password": get_password_hash("Teacher123!"),
            "full_name": "Dr. S. Natarajan",
            "role": "teacher",
            "department": "Computer Science",
            "designation": "Associate Professor & Faculty Mentor",
            "is_active": True,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "email": "admin@college.edu",
            "hashed_password": get_password_hash("Admin123!"),
            "full_name": "System Administrator",
            "role": "admin",
            "department": "Information Technology",
            "is_active": True,
            "created_at": datetime.now(timezone.utc)
        }
    ]
    u_ids = MongoCRUD.create_many("users", users_data)
    print(f"  [OK] Seeded {len(u_ids)} user accounts in 'users'")

    # 3. Seed Students Collection
    primary_student = {
        "student_id": "STU1001",
        "name": "Nithyasri S",
        "email": "student@college.edu",
        "department": "Computer Science",
        "semester": 4,
        "academic_year": "2025-2026",
        "status": "Active",
        "cgpa": 9.4,
        "enrolled_date": datetime(2024, 7, 15, tzinfo=timezone.utc),
        "created_at": datetime.now(timezone.utc)
    }

    cohort_students = [
        ("Aarav Sundaram", "Computer Science", 4, 8.2),
        ("Aditi Krishnan", "Information Technology", 4, 8.9),
        ("Bhavya Ramesh", "Software Engineering", 4, 7.6),
        ("Deepak Sharma", "Artificial Intelligence & Data Science", 4, 6.4),
        ("Divya Balaji", "Computer Science", 4, 9.1),
        ("Ganesh Murugan", "Information Technology", 4, 7.1),
        ("Harini Venkatesh", "Computer Science", 4, 8.5),
        ("Ishaan Reddy", "Software Engineering", 4, 8.7),
        ("Kavya Iyer", "Artificial Intelligence & Data Science", 4, 5.8),
        ("Madhav Pillai", "Computer Applications", 4, 7.8),
        ("Meera Gopal", "Information Technology", 4, 9.0),
        ("Naveen Subramanian", "Computer Science", 4, 7.2),
        ("Pooja Menon", "Software Engineering", 4, 8.4),
        ("Rahul Chopra", "Artificial Intelligence & Data Science", 4, 7.4),
        ("Rhea Devi", "Computer Applications", 4, 9.2),
        ("Rohit Rao", "Information Technology", 4, 6.8),
        ("Sai Ramachandran", "Computer Science", 4, 8.1),
        ("Sneha Patel", "Software Engineering", 4, 8.8),
        ("Surya Kumar", "Artificial Intelligence & Data Science", 4, 7.3),
        ("Varun Natarajan", "Computer Applications", 4, 7.5)
    ]

    all_students_data = [primary_student]
    for idx, (name, dept, sem, cgpa) in enumerate(cohort_students, start=1002):
        sid = f"STU{idx}"
        all_students_data.append({
            "student_id": sid,
            "name": name,
            "email": f"{sid.lower()}@college.edu",
            "department": dept,
            "semester": sem,
            "academic_year": "2025-2026",
            "status": "Active",
            "cgpa": cgpa,
            "enrolled_date": datetime(2024, 7, 15, tzinfo=timezone.utc),
            "created_at": datetime.now(timezone.utc)
        })

    stu_ids = MongoCRUD.create_many("students", all_students_data)
    print(f"  [OK] Seeded {len(stu_ids)} student profiles in 'students'")

    # 4. Seed Academic Records Collection
    subjects = [
        ("CS401", "Design and Analysis of Algorithms"),
        ("CS402", "Database Management Systems"),
        ("CS403", "Machine Learning & AI Foundations"),
        ("CS404", "Computer Networks & Security"),
        ("CS405", "Advanced Web Application Development")
    ]

    academic_records_data = []
    for s in all_students_data:
        is_nithyasri = (s["student_id"] == "STU1001")
        for code, sname in subjects:
            if is_nithyasri:
                academic_records_data.append({
                    "student_id": s["student_id"],
                    "student_name": s["name"],
                    "subject_code": code,
                    "subject_name": sname,
                    "semester": 4,
                    "attendance_percentage": 95.5,
                    "internal_marks": 92.0,
                    "assignment_score": 94.0,
                    "practical_score": 96.0,
                    "previous_semester_percentage": 91.5,
                    "study_hours_per_week": 24.0,
                    "assignment_completion_percentage": 98.0,
                    "learning_activity_score": 95.0,
                    "target_score": 94.2,
                    "recorded_by": "Dr. S. Natarajan",
                    "created_at": datetime.now(timezone.utc)
                })
            else:
                cgpa_factor = s["cgpa"] / 10.0
                academic_records_data.append({
                    "student_id": s["student_id"],
                    "student_name": s["name"],
                    "subject_code": code,
                    "subject_name": sname,
                    "semester": 4,
                    "attendance_percentage": round(cgpa_factor * 85 + 10, 1),
                    "internal_marks": round(cgpa_factor * 80 + 15, 1),
                    "assignment_score": round(cgpa_factor * 82 + 12, 1),
                    "practical_score": round(cgpa_factor * 84 + 10, 1),
                    "previous_semester_percentage": round(s["cgpa"] * 9.5, 1),
                    "study_hours_per_week": round(cgpa_factor * 20 + 4, 1),
                    "assignment_completion_percentage": round(cgpa_factor * 85 + 10, 1),
                    "learning_activity_score": round(cgpa_factor * 80 + 12, 1),
                    "target_score": round(cgpa_factor * 88 + 8, 1),
                    "recorded_by": "Dr. S. Natarajan",
                    "created_at": datetime.now(timezone.utc)
                })

    rec_ids = MongoCRUD.create_many("academic_records", academic_records_data)
    print(f"  [OK] Seeded {len(rec_ids)} course assessment records in 'academic_records'")

    # 5. Seed Model Registry Collection
    models_data = [
        {
            "name": "Linear Regression",
            "algorithm": "Linear Regression (StandardScaler Pipeline)",
            "version": "1.0.0",
            "r2_score": 0.9414,
            "mae": 2.696,
            "rmse": 3.374,
            "cv_r2_mean": 0.9423,
            "is_active": True,
            "trained_at": datetime.now(timezone.utc)
        },
        {
            "name": "Ridge Regression",
            "algorithm": "Ridge Regression (alpha=1.0)",
            "version": "1.0.0",
            "r2_score": 0.9414,
            "mae": 2.695,
            "rmse": 3.374,
            "cv_r2_mean": 0.9423,
            "is_active": False,
            "trained_at": datetime.now(timezone.utc)
        },
        {
            "name": "Gradient Boosting Regressor",
            "algorithm": "Gradient Boosting (n_estimators=120, lr=0.08)",
            "version": "1.0.0",
            "r2_score": 0.9342,
            "mae": 2.890,
            "rmse": 3.576,
            "cv_r2_mean": 0.9366,
            "is_active": False,
            "trained_at": datetime.now(timezone.utc)
        },
        {
            "name": "Random Forest Regressor",
            "algorithm": "Random Forest (n_estimators=100, max_depth=10)",
            "version": "1.0.0",
            "r2_score": 0.9260,
            "mae": 3.057,
            "rmse": 3.792,
            "cv_r2_mean": 0.9344,
            "is_active": False,
            "trained_at": datetime.now(timezone.utc)
        }
    ]
    m_ids = MongoCRUD.create_many("model_registry", models_data)
    print(f"  [OK] Seeded {len(m_ids)} candidate ML models in 'model_registry'")

    # 6. Seed Predictions Collection
    predictions_data = [
        {
            "student_id": "STU1001",
            "student_name": "Nithyasri S",
            "model_name": "Linear Regression",
            "estimated_score": 93.4,
            "lower_bound": 87.9,
            "upper_bound": 98.9,
            "performance_category": "Distinction",
            "support_priority": "Good Standing",
            "confidence_note": "Residual standard error: ±3.374",
            "feature_inputs": {
                "attendance_percentage": 95.5,
                "internal_marks": 92.0,
                "assignment_score": 94.0,
                "practical_score": 96.0,
                "previous_semester_percentage": 91.5,
                "study_hours_per_week": 24.0,
                "assignment_completion_percentage": 98.0,
                "learning_activity_score": 95.0
            },
            "performed_by": "Dr. S. Natarajan",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "student_id": "STU1005",
            "student_name": "Deepak Sharma",
            "model_name": "Linear Regression",
            "estimated_score": 44.2,
            "lower_bound": 38.7,
            "upper_bound": 49.7,
            "performance_category": "Needs Support",
            "support_priority": "High Academic Priority",
            "confidence_note": "Residual standard error: ±3.374",
            "feature_inputs": {
                "attendance_percentage": 58.5,
                "internal_marks": 42.0,
                "assignment_score": 50.0,
                "practical_score": 48.0,
                "previous_semester_percentage": 45.0,
                "study_hours_per_week": 8.0,
                "assignment_completion_percentage": 56.0,
                "learning_activity_score": 40.0
            },
            "performed_by": "Dr. S. Natarajan",
            "created_at": datetime.now(timezone.utc)
        }
    ]
    p_ids = MongoCRUD.create_many("predictions", predictions_data)
    print(f"  [OK] Seeded {len(p_ids)} estimation histories in 'predictions'")

    # 7. Seed Support Notes Collection
    support_notes_data = [
        {
            "student_id": "STU1001",
            "student_name": "Nithyasri S",
            "teacher_name": "Dr. S. Natarajan",
            "priority": "Good Standing",
            "title": "Department Honor Roll & Research Mentorship",
            "note": "Exemplary performance across Algorithms, AI and Web Labs. Nominated for University Technical Symposium.",
            "action_plan": "Guidance on technical paper submission; peer mentoring coordination.",
            "resolved": True,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "student_id": "STU1005",
            "student_name": "Deepak Sharma",
            "teacher_name": "Dr. S. Natarajan",
            "priority": "High",
            "title": "Attendance Remediation & Internal Retest Support",
            "note": "Attendance currently 58.5% due to medical absence. Internal marks require immediate revision.",
            "action_plan": "Scheduled 1-on-1 counseling every Friday; assigned lab peer-tutor.",
            "resolved": False,
            "created_at": datetime.now(timezone.utc)
        }
    ]
    sn_ids = MongoCRUD.create_many("support_notes", support_notes_data)
    print(f"  [OK] Seeded {len(sn_ids)} faculty support notes in 'support_notes'")

    print("\n" + "=" * 70)
    print("VERIFYING COMPLETE CRUD OPERATIONS ON MONGODB DATABASE:")
    print("=" * 70)

    # 1. CREATE Verification
    test_doc = {
        "student_id": "STU9999",
        "name": "CRUD Test Student",
        "email": "crudtest@college.edu",
        "department": "Computer Science",
        "semester": 4,
        "academic_year": "2025-2026",
        "status": "Testing",
        "test_marker": True
    }
    created = MongoCRUD.create("students", test_doc)
    doc_id = created["id"]
    print(f"1. [CREATE] SUCCESS -> Inserted test doc with ID: {doc_id}")

    # 2. READ Verification
    fetched = MongoCRUD.get_by_id("students", doc_id)
    assert fetched is not None, "Failed to read created document"
    assert fetched["student_id"] == "STU9999"
    print(f"2. [READ]   SUCCESS -> Fetched document: {fetched['name']} ({fetched['student_id']})")

    # 3. UPDATE Verification
    updated = MongoCRUD.update("students", doc_id, {"status": "Verified Active", "note": "Updated via MongoCRUD"})
    assert updated is not None
    assert updated["status"] == "Verified Active"
    print(f"3. [UPDATE] SUCCESS -> Updated status to '{updated['status']}'")

    # 4. DELETE Verification
    deleted = MongoCRUD.delete("students", doc_id)
    assert deleted is True, "Failed to delete test document"
    verify_none = MongoCRUD.get_by_id("students", doc_id)
    assert verify_none is None, "Document should be deleted"
    print(f"4. [DELETE] SUCCESS -> Deleted test document {doc_id}")

    print("\n" + "=" * 70)
    print("ALL MONGODB COLLECTIONS SUMMARY:")
    print("=" * 70)
    collections_summary = MongoCRUD.list_collections()
    for item in collections_summary:
        print(f"  Collection: {item['collection_name']:<22} | Document Count: {item['document_count']}")
    print("=" * 70)
    print("MongoDB Atlas Database successfully initialized and seeded for:")
    print("Project Owner: Nithyasri S")
    print("=" * 70)

if __name__ == "__main__":
    seed_mongodb_database()
