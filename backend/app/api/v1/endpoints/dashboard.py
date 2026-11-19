import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import StudentProfile, StudentSkill, Skill, DigitalTwinSnapshot, ActivityEvent, StudentRoleMatch, CareerRole
from app.schemas.twin import DashboardOverviewOut, BlindSpotItem
from app.schemas.skill import StudentSkillOut
from app.api.dependencies import get_current_student
from app.intelligence.explanation_engine import ExplanationEngine

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/overview", response_model=DashboardOverviewOut)
def get_dashboard_overview(
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    # Fetch recent snapshot
    snapshot = db.query(DigitalTwinSnapshot).filter(
        DigitalTwinSnapshot.student_id == student.id
    ).order_by(DigitalTwinSnapshot.id.desc()).first()

    readiness = snapshot.overall_readiness if snapshot else 48.0
    velocity = snapshot.learning_velocity if snapshot else 2.4
    bottlenecks = json.loads(snapshot.identified_bottlenecks_json) if snapshot and snapshot.identified_bottlenecks_json else []
    blindspots_data = json.loads(snapshot.identified_blindspots_json) if snapshot and snapshot.identified_blindspots_json else []

    blindspot_items = [
        BlindSpotItem(
            skill_name=b.get("skill_name", "Skill"),
            skill_slug=b.get("skill_slug", "skill"),
            self_reported_score=float(b.get("self_reported_score", 0.0)),
            assessed_score=float(b.get("assessed_score", 0.0)),
            discrepancy=float(b.get("discrepancy", 0.0)),
            nature=b.get("nature", "overestimation"),
            explanation=b.get("explanation", "")
        ) for b in blindspots_data
    ]

    # Target role alignment
    target_role_name = student.target_role or "Backend Developer"
    role = db.query(CareerRole).filter(CareerRole.name == target_role_name).first()
    role_alignment_val = 65.0
    if role:
        match = db.query(StudentRoleMatch).filter(
            StudentRoleMatch.student_id == student.id,
            StudentRoleMatch.role_id == role.id
        ).first()
        if match:
            role_alignment_val = match.alignment_score

    # Student skills
    skills_query = db.query(StudentSkill, Skill).join(Skill, StudentSkill.skill_id == Skill.id).filter(
        StudentSkill.student_id == student.id
    ).order_by(StudentSkill.proficiency_score.desc()).all()

    top_strengths = []
    for ss, sk in skills_query[:4]:
        top_strengths.append(StudentSkillOut(
            id=ss.id,
            skill_id=sk.id,
            name=sk.name,
            slug=sk.slug,
            category=sk.category,
            proficiency_score=ss.proficiency_score,
            confidence_score=ss.confidence_score,
            evidence_count=ss.evidence_count,
            self_reported_score=ss.self_reported_score,
            assessed_score=ss.assessed_score,
            trend_direction=ss.trend_direction,
            velocity_score=ss.velocity_score,
            last_assessed_at=ss.last_assessed_at
        ))

    # Next Best Action
    priority_slug = "trees"
    if bottlenecks:
        priority_slug = bottlenecks[0].get("skill_slug", "trees")
        expl = ExplanationEngine.explain_recommendation(
            target_role=target_role_name,
            priority_skill=bottlenecks[0].get("skill_name", "Trees"),
            current_score=bottlenecks[0].get("current_score", 35.0),
            target_score=75.0,
            bottleneck_info=bottlenecks[0]
        )
    else:
        expl = ExplanationEngine.explain_recommendation(
            target_role=target_role_name,
            priority_skill="Binary Tree Traversal",
            current_score=38.0,
            target_score=75.0
        )

    next_best_action = {
        "title": expl["headline"],
        "action": expl["action"],
        "rationale": expl["rationale"],
        "priority_skill": priority_slug,
        "estimated_duration": "45 mins"
    }

    # Recent activity
    activities = db.query(ActivityEvent).filter(
        ActivityEvent.student_id == student.id
    ).order_by(ActivityEvent.id.desc()).limit(5).all()

    act_list = [{
        "id": a.id,
        "title": a.title,
        "description": a.description,
        "event_type": a.event_type,
        "created_at": a.created_at.isoformat()
    } for a in activities]

    recent_changes = [snapshot.change_summary] if snapshot and snapshot.change_summary else [
        "Digital Twin initialized with baseline competencies."
    ]

    return DashboardOverviewOut(
        full_name=student.full_name,
        overall_readiness=readiness,
        learning_momentum=max(1.0, velocity * 10.0),
        career_alignment_score=role_alignment_val,
        interview_readiness_score=readiness * 0.9,
        primary_target_role=target_role_name,
        next_best_action=next_best_action,
        top_strengths=top_strengths,
        identified_bottlenecks=bottlenecks,
        blind_spots=blindspot_items,
        recent_activity=act_list,
        recent_changes=recent_changes
    )
