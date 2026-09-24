"""
Early Academic Support Alert Service
Students Performance Estimation System Using AI
Project Owner: Nithyasri S

Evaluates institutional safety rules and early warning indicators to alert faculty
before end-semester examinations.
"""

from typing import Any

def evaluate_early_support_triggers(features: dict[str, float], estimated_score: float) -> list[str]:
    """Generates precise institutional alert tags based on critical thresholds."""
    triggers = []

    att = features.get("attendance_percentage", 100.0)
    internals = features.get("internal_marks", 100.0)
    practicals = features.get("practical_score", 100.0)
    completion = features.get("assignment_completion_percentage", 100.0)
    study_hrs = features.get("study_hours_per_week", 20.0)

    if att < 65.0:
        triggers.append("CRITICAL: Severe Attendance Shortage (<65% - Detention Risk)")
    elif att < 75.0:
        triggers.append("WARNING: Attendance Below Mandatory University Norm (75%)")

    if internals < 40.0:
        triggers.append("CRITICAL: Internal Examination Failure Risk (<40 Marks)")
    elif internals < 50.0:
        triggers.append("ATTENTION: Low Internal Assessment Performance (<50 Marks)")

    if practicals < 50.0:
        triggers.append("ATTENTION: Laboratory Assessment Deficit (<50 Marks)")

    if completion < 60.0:
        triggers.append("ALERT: Chronic Assignment Non-Submission (<60% Completed)")

    if study_hrs < 8.0:
        triggers.append("GUIDANCE: Sub-Optimal Self-Study Engagement (<8 Hours/Week)")

    if estimated_score < 45.0:
        triggers.append("PRIORITY: Estimated Final Score In At-Risk Band (<45/100)")

    return triggers
