"""
Dataset Generation Script for Students Performance Estimation System Using AI
Project Owner: Nithyasri S
Domain: Educational Data Mining & Student Performance Analytics

Generates a realistic, statistically grounded synthetic dataset of student academic,
attendance, and engagement records across semesters and degree programs.
"""

import os
import numpy as np
import pandas as pd

def generate_student_dataset(n_samples: int = 1200, random_seed: int = 42) -> pd.DataFrame:
    np.random.seed(random_seed)

    departments = [
        "Computer Science",
        "Information Technology",
        "Computer Applications",
        "Software Engineering",
        "Artificial Intelligence & Data Science"
    ]
    
    first_names = [
        "Aarav", "Aditi", "Ananya", "Arun", "Bhavya", "Deepak", "Divya", "Ganesh",
        "Harini", "Ishaan", "Kavya", "Keerthana", "Madhav", "Meera", "Naveen",
        "Nithya", "Pooja", "Pranav", "Rahul", "Rhea", "Rohit", "Sai", "Sanjay",
        "Sneha", "Surya", "Swetha", "Varun", "Vignesh", "Vikram", "Yamini"
    ]
    
    last_names = [
        "Sundaram", "Ramesh", "Balaji", "Krishnan", "Natarajan", "Subramanian",
        "Venkatesh", "Ramachandran", "Pillai", "Murugan", "Kumar", "Sharma",
        "Iyer", "Reddy", "Patel", "Gopal", "Menon", "Chopra", "Rao", "Devi"
    ]

    records = []
    
    for i in range(1, n_samples + 1):
        stu_id = f"STU{1000 + i}"
        name = f"{np.random.choice(first_names)} {np.random.choice(last_names)}"
        dept = np.random.choice(departments)
        sem = int(np.random.choice([1, 2, 3, 4, 5, 6], p=[0.15, 0.18, 0.20, 0.20, 0.15, 0.12]))

        # Base student capability factor (latent variable ~ N(68, 14))
        latent_ability = np.clip(np.random.normal(68, 14), 30, 98)

        # Study hours per week (2 to 35 hours)
        study_hours = np.clip(np.random.normal(latent_ability * 0.25, 4.0), 2.5, 35.0)

        # Attendance percentage (50% to 100%) - correlated with engagement
        attendance = np.clip(np.random.normal(latent_ability * 0.45 + 46, 7.5), 48.0, 99.5)

        # Previous semester percentage (40% to 98%)
        prev_sem = np.clip(np.random.normal(latent_ability * 0.90 + 5, 6.0), 40.0, 98.5)

        # Internal examination marks (out of 100)
        internal_marks = np.clip(np.random.normal(latent_ability * 0.85 + (study_hours * 0.6) + 4, 6.5), 25.0, 99.0)

        # Assignment score (out of 100)
        assignment_score = np.clip(np.random.normal(latent_ability * 0.75 + (study_hours * 0.8) + 12, 7.0), 30.0, 100.0)

        # Practical / Lab examination score (out of 100)
        practical_score = np.clip(np.random.normal(latent_ability * 0.80 + 10, 8.0), 32.0, 100.0)

        # Assignment completion percentage (35% to 100%)
        completion_pct = np.clip(np.random.normal(attendance * 0.60 + (study_hours * 1.2) + 20, 7.0), 35.0, 100.0)

        # Learning activity score (participation, quizzes, coding exercises)
        learning_activity = np.clip(np.random.normal(latent_ability * 0.70 + (completion_pct * 0.25), 8.5), 20.0, 100.0)

        # Realistic final score calculation
        # Formula balances core internal continuous assessments and student engagement
        raw_final = (
            0.26 * internal_marks +
            0.20 * practical_score +
            0.18 * prev_sem +
            0.12 * assignment_score +
            0.10 * (attendance * 0.8) +
            0.08 * (completion_pct * 0.7) +
            0.06 * (learning_activity * 0.6) +
            (study_hours * 0.35)
        )

        # Realistic non-linear factors: severe penalty if attendance is critical (< 65%)
        if attendance < 65.0:
            raw_final -= (65.0 - attendance) * 0.35
            
        # Synergy boost for high effort + high assignment completion
        if study_hours > 20 and completion_pct > 85:
            raw_final += 3.5

        # Stochastic noise modeling unobserved factors (exam day condition, question variation)
        noise = np.random.normal(0, 3.2)
        final_score = np.clip(raw_final + noise, 25.0, 99.5)

        # Performance category
        if final_score >= 80.0:
            category = "Distinction"
            support_status = "Good Standing"
        elif final_score >= 60.0:
            category = "First Class"
            support_status = "Good Standing"
        elif final_score >= 45.0:
            category = "Pass / Average"
            support_status = "Moderate Monitoring"
        else:
            category = "Needs Support"
            support_status = "High Academic Priority"

        records.append({
            "student_id": stu_id,
            "name": name,
            "department": dept,
            "semester": sem,
            "attendance_percentage": round(float(attendance), 1),
            "internal_marks": round(float(internal_marks), 1),
            "assignment_score": round(float(assignment_score), 1),
            "practical_score": round(float(practical_score), 1),
            "previous_semester_percentage": round(float(prev_sem), 1),
            "study_hours_per_week": round(float(study_hours), 1),
            "assignment_completion_percentage": round(float(completion_pct), 1),
            "learning_activity_score": round(float(learning_activity), 1),
            "final_score": round(float(final_score), 1),
            "performance_category": category,
            "support_priority": support_status
        })

    df = pd.DataFrame(records)
    return df

if __name__ == "__main__":
    os.makedirs("ml/data", exist_ok=True)
    df = generate_student_dataset(n_samples=1200)
    output_path = os.path.join("ml", "data", "student_performance_dataset.csv")
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} student records at {output_path}")
    print("\nSummary Statistics:")
    print(df[["attendance_percentage", "internal_marks", "study_hours_per_week", "final_score"]].describe())
