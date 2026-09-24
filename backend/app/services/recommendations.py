"""
AI Pedagogical Recommendation Engine
Students Performance Estimation System Using AI
Project Owner: Nithyasri S

Provides transparent, rule-grounded educational recommendations tailored to
student inputs across study habits, continuous assessments, laboratory work,
and attendance discipline.
"""

from typing import Any

def generate_academic_recommendations(features: dict[str, float], estimated_score: float) -> list[dict[str, Any]]:
    recommendations = []

    att = features.get("attendance_percentage", 100.0)
    internals = features.get("internal_marks", 100.0)
    assignments = features.get("assignment_score", 100.0)
    practicals = features.get("practical_score", 100.0)
    study_hrs = features.get("study_hours_per_week", 20.0)
    completion = features.get("assignment_completion_percentage", 100.0)
    activities = features.get("learning_activity_score", 100.0)
    prev_sem = features.get("previous_semester_percentage", 100.0)

    # 1. Attendance Recommendation
    if att < 75.0:
        recommendations.append({
            "category": "Attendance & Classroom Engagement",
            "title": "Institutional Attendance Threshold Alert",
            "priority": "High",
            "description": f"Current attendance is {att:.1f}%, which is below the standard 75% institutional eligibility threshold. Regular attendance has an estimated 8.3% direct positive weighting on final outcomes and is vital for classroom continuity.",
            "action_steps": [
                "Meet with the assigned faculty mentor to review attendance remediation procedures.",
                "Target attending 100% of upcoming lecture sessions to recover lost margin.",
                "Verify whether legitimate medical or institutional event leaves have been officially regularized."
            ]
        })
    elif att < 85.0:
        recommendations.append({
            "category": "Attendance & Classroom Engagement",
            "title": "Optimize Class Continuity",
            "priority": "Medium",
            "description": f"Attendance is satisfactory ({att:.1f}%), but boosting it to >= 85% provides a stronger academic safety buffer.",
            "action_steps": [
                "Maintain punctuality in first-hour lectures.",
                "Participate actively in classroom discussions and interactive problem-solving."
            ]
        })

    # 2. Continuous Internal Assessment Recommendation
    if internals < 50.0:
        recommendations.append({
            "category": "Internal Examination Mastery",
            "title": "Immediate Core Concept Revision Required",
            "priority": "High",
            "description": f"Continuous Internal Assessment score is {internals:.1f}/100. Internal marks carry the highest single weight (~25.4%) in final performance estimation.",
            "action_steps": [
                "Conduct chapter-by-chapter revision focusing on fundamental definitions, theorems, and core algorithms.",
                "Solve previous 3 years' university internal examination question papers.",
                "Schedule doubt-clearing sessions during faculty office hours."
            ]
        })
    elif internals < 70.0:
        recommendations.append({
            "category": "Internal Examination Mastery",
            "title": "Target High-Scoring Numerical & Analytical Modules",
            "priority": "Medium",
            "description": f"Internal score is moderate ({internals:.1f}/100). Focused preparation on structured descriptive and analytical questions can boost marks above 80.",
            "action_steps": [
                "Create summary formula sheets and architectural diagrams for quick pre-exam review.",
                "Practice timed mock tests to enhance speed and answer structure."
            ]
        })

    # 3. Study Hours Calibration
    if study_hrs < 10.0:
        recommendations.append({
            "category": "Study Habits & Time Management",
            "title": "Low Weekly Self-Study Hours Deficit",
            "priority": "High",
            "description": f"Current self-study allocation of {study_hrs:.1f} hours/week is below the recommended threshold (15-20 hours/week) for technical coursework.",
            "action_steps": [
                "Adopt the Pomodoro technique: study in 25-minute focused blocks with 5-minute intervals.",
                "Block out dedicated slots in your weekly calendar specifically for problem solving and programming practice.",
                "Gradually increase self-study by 30 minutes each day towards a 16-18 hour weekly target."
            ]
        })
    elif study_hrs > 28.0:
        recommendations.append({
            "category": "Study Habits & Time Management",
            "title": "Study Schedule Optimization & Burnout Prevention",
            "priority": "Medium",
            "description": f"Reported study time is {study_hrs:.1f} hours/week. High study volume is commendable, but ensure quality of focus and restful breaks.",
            "action_steps": [
                "Prioritize active recall and spaced repetition over passive re-reading.",
                "Ensure sufficient sleep and physical recreation to prevent exam fatigue."
            ]
        })

    # 4. Practical & Laboratory Performance
    if practicals < 60.0:
        recommendations.append({
            "category": "Practical & Laboratory Skills",
            "title": "Hands-On Lab Execution Improvement",
            "priority": "High",
            "description": f"Practical score is {practicals:.1f}/100. Laboratory exercises carry ~15.4% weight and reinforce theoretical concepts through experiential implementation.",
            "action_steps": [
                "Re-run weekly lab experiments independently in the computer laboratory or simulation environment.",
                "Maintain complete and verified lab record notebooks before each practical cycle.",
                "Practice viva-voce questions and code debugging techniques."
            ]
        })

    # 5. Assignment Completion & Learning Activities
    if completion < 75.0 or assignments < 65.0:
        recommendations.append({
            "category": "Continuous Assessment & Assignments",
            "title": "Punctual Assignment Submission Workflow",
            "priority": "Medium",
            "description": f"Assignment completion is {completion:.1f}% with an average score of {assignments:.1f}/100. Punctual submission directly prevents last-minute submission penalties.",
            "action_steps": [
                "Break large assignments down into 3 milestones: analysis, drafting, and final review.",
                "Submit draft submissions 24 hours prior to deadline to allow feedback."
            ]
        })

    if activities < 60.0:
        recommendations.append({
            "category": "Active Learning & Digital Platform Participation",
            "title": "Engage in Quizzes, Coding Portals & Group Discussions",
            "priority": "Medium",
            "description": f"Learning activity score is {activities:.1f}/100. Collaborative peer-learning and online quizzes significantly consolidate understanding.",
            "action_steps": [
                "Complete weekly LMS module quizzes and self-assessment challenges.",
                "Form peer study groups to explain complex topics to each other."
            ]
        })

    # If the student is performing well overall
    if estimated_score >= 80.0 and len(recommendations) == 0:
        recommendations.append({
            "category": "Excellence & Advanced Learning",
            "title": "Maintain Distinction Momentum & Explore Research Opportunities",
            "priority": "Good Standing",
            "description": "Consistent high performance across all dimensions puts you on track for Distinction and Department Rank honours.",
            "action_steps": [
                "Participate in technical symposiums, hackathons, and open-source project initiatives.",
                "Consider assisting peers through academic peer-tutoring.",
                "Explore undergraduate research projects or industry certification pathways."
            ]
        })

    return recommendations
