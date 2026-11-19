import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import StudentProfile, DigitalTwinSnapshot, CareerRole, RoleSkillRequirement, StudentSkill, Skill
from app.schemas.twin import TwinSnapshotOut, FutureSelfSimulateRequest, FutureSelfSimulateResponse
from app.api.dependencies import get_current_student
from app.intelligence.simulation_engine import SimulationEngine

router = APIRouter(prefix="/digital-twin", tags=["Digital Twin"])

@router.get("/me", response_model=TwinSnapshotOut)
def get_current_twin(
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    snapshot = db.query(DigitalTwinSnapshot).filter(
        DigitalTwinSnapshot.student_id == student.id
    ).order_by(DigitalTwinSnapshot.id.desc()).first()

    if not snapshot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No Digital Twin snapshot exists yet. Please complete onboarding or assessments."
        )

    return TwinSnapshotOut(
        id=snapshot.id,
        model_version=snapshot.model_version,
        overall_readiness=snapshot.overall_readiness,
        learning_velocity=snapshot.learning_velocity,
        consistency_score=snapshot.consistency_score,
        skill_state=json.loads(snapshot.skill_state_json),
        role_alignment=json.loads(snapshot.role_alignment_json),
        identified_bottlenecks=json.loads(snapshot.identified_bottlenecks_json or "[]"),
        identified_blindspots=json.loads(snapshot.identified_blindspots_json or "[]"),
        change_summary=snapshot.change_summary,
        created_at=snapshot.created_at
    )

@router.get("/me/history", response_model=List[TwinSnapshotOut])
def get_twin_history(
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    snapshots = db.query(DigitalTwinSnapshot).filter(
        DigitalTwinSnapshot.student_id == student.id
    ).order_by(DigitalTwinSnapshot.id.desc()).limit(20).all()

    return [
        TwinSnapshotOut(
            id=s.id,
            model_version=s.model_version,
            overall_readiness=s.overall_readiness,
            learning_velocity=s.learning_velocity,
            consistency_score=s.consistency_score,
            skill_state=json.loads(s.skill_state_json),
            role_alignment=json.loads(s.role_alignment_json),
            identified_bottlenecks=json.loads(s.identified_bottlenecks_json or "[]"),
            identified_blindspots=json.loads(s.identified_blindspots_json or "[]"),
            change_summary=s.change_summary,
            created_at=s.created_at
        ) for s in snapshots
    ]

@router.post("/me/simulate", response_model=FutureSelfSimulateResponse)
def simulate_future_self(
    payload: FutureSelfSimulateRequest,
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    # Fetch current skills map
    student_skills = db.query(StudentSkill, Skill).join(Skill, StudentSkill.skill_id == Skill.id).filter(
        StudentSkill.student_id == student.id
    ).all()

    skills_map = {}
    for ss, sk in student_skills:
        skills_map[sk.slug] = {
            "proficiency_score": ss.proficiency_score,
            "confidence_score": ss.confidence_score,
            "evidence_count": ss.evidence_count
        }

    # Fetch role requirements
    role = db.query(CareerRole).filter(CareerRole.slug == payload.target_role_slug).first()
    if not role:
        role = db.query(CareerRole).first()

    reqs = db.query(RoleSkillRequirement).filter(RoleSkillRequirement.role_id == role.id).all()
    req_dicts = []
    for rq in reqs:
        rq_skill = db.query(Skill).filter(Skill.id == rq.skill_id).first()
        if rq_skill:
            req_dicts.append({
                "skill_slug": rq_skill.slug,
                "skill_name": rq_skill.name,
                "importance_weight": rq.importance_weight,
                "expected_proficiency": rq.expected_proficiency,
                "is_mandatory": rq.is_mandatory
            })

    # Run isolated simulation
    sim_res = SimulationEngine.simulate_hypothetical_growth(
        current_skills_map=skills_map,
        role_requirements=req_dicts,
        hypothetical_adjustments=payload.hypothetical_skills
    )

    return FutureSelfSimulateResponse(
        current_readiness=sim_res["current_readiness"],
        projected_readiness=sim_res["projected_readiness"],
        delta_readiness=sim_res["delta_readiness"],
        target_role_slug=role.slug,
        current_role_alignment=sim_res["current_alignment"],
        projected_role_alignment=sim_res["projected_alignment"],
        delta_role_alignment=sim_res["delta_alignment"],
        unlocked_competencies=sim_res["unlocked_competencies"],
        rationale=sim_res["rationale"],
        is_hypothetical=True
    )
