from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import StudentProfile, CodingSubmission, InterviewSession, StudentSkill, Skill, DigitalTwinSnapshot
from app.api.dependencies import get_current_student

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview")
def get_analytics_overview(
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    # Snapshot history
    snapshots = db.query(DigitalTwinSnapshot).filter(
        DigitalTwinSnapshot.student_id == student.id
    ).order_by(DigitalTwinSnapshot.id.asc()).limit(15).all()

    readiness_timeline = [{
        "date": s.created_at.strftime("%b %d"),
        "overall_readiness": s.overall_readiness,
        "velocity": s.learning_velocity,
        "confidence": s.consistency_score
    } for s in snapshots]

    # Submissions timeline
    subs = db.query(CodingSubmission).filter(
        CodingSubmission.student_id == student.id
    ).order_by(CodingSubmission.id.asc()).all()

    coding_performance = [{
        "attempt": i + 1,
        "score": s.score,
        "runtime_ms": s.runtime_ms,
        "status": s.status
    } for i, s in enumerate(subs)]

    # Domain proficiency breakdown
    skills_query = db.query(StudentSkill, Skill).join(Skill, StudentSkill.skill_id == Skill.id).filter(
        StudentSkill.student_id == student.id
    ).all()

    domain_breakdown = [{
        "skill": sk.name,
        "proficiency": ss.proficiency_score,
        "confidence": ss.confidence_score,
        "evidence_count": ss.evidence_count,
        "trend": ss.trend_direction
    } for ss, sk in skills_query]

    # Interview trend
    interviews = db.query(InterviewSession).filter(
        InterviewSession.student_id == student.id
    ).order_by(InterviewSession.id.asc()).all()

    interview_trend = [{
        "topic": inv.topic,
        "technical_score": inv.technical_score,
        "communication_score": inv.communication_score,
        "overall": inv.overall_score
    } for inv in interviews]

    return {
        "readiness_timeline": readiness_timeline,
        "coding_performance": coding_performance,
        "domain_breakdown": domain_breakdown,
        "interview_trend": interview_trend,
        "metrics_summary": {
            "total_coding_submissions": len(subs),
            "total_interviews": len(interviews),
            "total_skills_mapped": len(skills_query),
            "current_momentum": "Accelerating" if len(subs) >= 3 else "Initial Phase"
        }
    }
