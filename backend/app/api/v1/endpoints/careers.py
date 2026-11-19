import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models import StudentProfile, CareerRole, RoleSkillRequirement, StudentRoleMatch, Skill, StudentSkill
from app.schemas.career import CareerRoleOut, RoleSkillRequirementOut, CareerCompareRequest, CareerCompareResponse
from app.api.dependencies import get_current_student

router = APIRouter(prefix="/careers", tags=["Career Explorer"])

@router.get("/roles", response_model=List[CareerRoleOut])
def get_career_roles(
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    roles = db.query(CareerRole).filter(CareerRole.is_active == True).all()
    out = []
    for r in roles:
        match = db.query(StudentRoleMatch).filter(
            StudentRoleMatch.student_id == student.id,
            StudentRoleMatch.role_id == r.id
        ).first()

        strengths = json.loads(match.strengths_json) if match and match.strengths_json else []
        gaps = json.loads(match.gaps_json) if match and match.gaps_json else []

        # Requirements
        reqs = db.query(RoleSkillRequirement, Skill).join(Skill, RoleSkillRequirement.skill_id == Skill.id).filter(
            RoleSkillRequirement.role_id == r.id
        ).all()

        req_out = []
        for rq, sk in reqs:
            st_sk = db.query(StudentSkill).filter(
                StudentSkill.student_id == student.id,
                StudentSkill.skill_id == sk.id
            ).first()
            prof = st_sk.proficiency_score if st_sk else 0.0
            conf = st_sk.confidence_score if st_sk else 0.0
            req_out.append(RoleSkillRequirementOut(
                skill_name=sk.name,
                skill_slug=sk.slug,
                category=sk.category,
                importance_weight=rq.importance_weight,
                expected_proficiency=rq.expected_proficiency,
                student_proficiency=prof,
                student_confidence=conf,
                is_mandatory=rq.is_mandatory
            ))

        out.append(CareerRoleOut(
            id=r.id,
            name=r.name,
            slug=r.slug,
            description=r.description,
            category=r.category,
            market_demand=r.market_demand,
            alignment_score=match.alignment_score if match else 50.0,
            readiness_score=match.readiness_score if match else 45.0,
            evidence_coverage=match.evidence_coverage if match else 40.0,
            strengths=strengths,
            gaps=gaps,
            explanation=match.explanation_text if match else "Alignment derived from verified competencies.",
            requirements=req_out
        ))
    return out

@router.post("/compare", response_model=CareerCompareResponse)
def compare_roles(
    payload: CareerCompareRequest,
    student: StudentProfile = Depends(get_current_student),
    db: Session = Depends(get_db)
):
    roles_out = []
    skills_by_role = {}
    for rid in payload.role_ids:
        r = db.query(CareerRole).filter(CareerRole.id == rid).first()
        if r:
            match = db.query(StudentRoleMatch).filter(
                StudentRoleMatch.student_id == student.id,
                StudentRoleMatch.role_id == r.id
            ).first()

            reqs = db.query(RoleSkillRequirement, Skill).join(Skill, RoleSkillRequirement.skill_id == Skill.id).filter(
                RoleSkillRequirement.role_id == r.id
            ).all()
            req_list = []
            skills_by_role[r.name] = set()
            for rq, sk in reqs:
                skills_by_role[r.name].add(sk.name)
                st_sk = db.query(StudentSkill).filter(
                    StudentSkill.student_id == student.id,
                    StudentSkill.skill_id == sk.id
                ).first()
                req_list.append(RoleSkillRequirementOut(
                    skill_name=sk.name,
                    skill_slug=sk.slug,
                    category=sk.category,
                    importance_weight=rq.importance_weight,
                    expected_proficiency=rq.expected_proficiency,
                    student_proficiency=st_sk.proficiency_score if st_sk else 0.0,
                    student_confidence=st_sk.confidence_score if st_sk else 0.0,
                    is_mandatory=rq.is_mandatory
                ))

            roles_out.append(CareerRoleOut(
                id=r.id,
                name=r.name,
                slug=r.slug,
                description=r.description,
                category=r.category,
                market_demand=r.market_demand,
                alignment_score=match.alignment_score if match else 50.0,
                readiness_score=match.readiness_score if match else 45.0,
                evidence_coverage=match.evidence_coverage if match else 40.0,
                strengths=json.loads(match.strengths_json) if match and match.strengths_json else [],
                gaps=json.loads(match.gaps_json) if match and match.gaps_json else [],
                explanation=match.explanation_text if match else "",
                requirements=req_list
            ))

    # Compute shared skills
    shared = set.intersection(*skills_by_role.values()) if skills_by_role else set()
    return CareerCompareResponse(
        roles=roles_out,
        shared_skills=list(shared)
    )
