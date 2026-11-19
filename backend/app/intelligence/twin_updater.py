import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import (
    StudentProfile, Skill, StudentSkill, SkillEvidence,
    DigitalTwinSnapshot, TwinUpdateEvent, ActivityEvent,
    CareerRole, RoleSkillRequirement, StudentRoleMatch, LearningRoadmap, RoadmapTask
)
from app.intelligence.skill_engine import SkillEngine
from app.intelligence.skill_graph import SkillDependencyGraph
from app.intelligence.role_matcher import RoleMatcher
from app.intelligence.blind_spot_detector import BlindSpotDetector
from app.intelligence.roadmap_generator import RoadmapGenerator
from app.intelligence.explanation_engine import ExplanationEngine

class TwinUpdater:
    @staticmethod
    def process_evidence_and_update_twin(
        db: Session,
        student_id: int,
        skill_id: int,
        source_type: str,
        source_id: str,
        raw_score: float,
        normalized_score: float,
        difficulty_weight: float = 1.0,
        evidence_quality: float = 1.0,
        metadata_dict: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        # 1. Create and persist SkillEvidence record
        evidence = SkillEvidence(
            student_id=student_id,
            skill_id=skill_id,
            source_type=source_type,
            source_id=str(source_id),
            raw_score=raw_score,
            normalized_score=normalized_score,
            difficulty_weight=difficulty_weight,
            recency_weight=1.0,
            evidence_quality=evidence_quality,
            assessment_metadata=json.dumps(metadata_dict or {}),
            created_at=datetime.now(timezone.utc)
        )
        db.add(evidence)
        db.flush()

        # 2. Retrieve all evidences for this student & skill
        all_evidences = db.query(SkillEvidence).filter(
            SkillEvidence.student_id == student_id,
            SkillEvidence.skill_id == skill_id
        ).all()

        ev_dicts = [{
            "source_type": e.source_type,
            "normalized_score": e.normalized_score,
            "difficulty_weight": e.difficulty_weight,
            "evidence_quality": e.evidence_quality,
            "created_at": e.created_at
        } for e in all_evidences]

        # 3. Find or create StudentSkill
        st_skill = db.query(StudentSkill).filter(
            StudentSkill.student_id == student_id,
            StudentSkill.skill_id == skill_id
        ).first()

        target_skill = db.query(Skill).filter(Skill.id == skill_id).first()
        skill_slug = target_skill.slug if target_skill else "skill"

        prev_score = st_skill.proficiency_score if st_skill else 0.0
        self_rep = st_skill.self_reported_score if st_skill else None

        prof, conf, trend, velocity = SkillEngine.calculate_skill_state(ev_dicts, self_rep)

        if not st_skill:
            st_skill = StudentSkill(
                student_id=student_id,
                skill_id=skill_id,
                proficiency_score=prof,
                confidence_score=conf,
                evidence_count=len(ev_dicts),
                assessed_score=prof,
                trend_direction=trend,
                velocity_score=velocity,
                last_assessed_at=datetime.now(timezone.utc)
            )
            db.add(st_skill)
        else:
            st_skill.proficiency_score = prof
            st_skill.confidence_score = conf
            st_skill.evidence_count = len(ev_dicts)
            st_skill.assessed_score = prof
            st_skill.trend_direction = trend
            st_skill.velocity_score = velocity
            st_skill.last_assessed_at = datetime.now(timezone.utc)

        db.flush()

        # 4. Gather full skills map for twin recalculation
        all_student_skills = db.query(StudentSkill).filter(StudentSkill.student_id == student_id).all()
        skills_map = {}
        skills_list_for_blindspots = []
        for ss in all_student_skills:
            sk = db.query(Skill).filter(Skill.id == ss.skill_id).first()
            if sk:
                skills_map[sk.slug] = {
                    "proficiency_score": ss.proficiency_score,
                    "confidence_score": ss.confidence_score,
                    "evidence_count": ss.evidence_count
                }
                skills_list_for_blindspots.append({
                    "name": sk.name,
                    "slug": sk.slug,
                    "self_reported_score": ss.self_reported_score,
                    "assessed_score": ss.assessed_score
                })

        # 5. Bottlenecks and Blindspots
        graph = SkillDependencyGraph()
        bottlenecks = graph.identify_bottlenecks(skills_map)
        blindspots = BlindSpotDetector.detect_blind_spots(skills_list_for_blindspots)

        # 6. Evaluate Career Roles
        student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
        target_role_name = student.target_role or "Backend Developer"

        roles = db.query(CareerRole).filter(CareerRole.is_active == True).all()
        role_alignments = {}
        overall_readiness_val = 50.0

        for r in roles:
            reqs = db.query(RoleSkillRequirement).filter(RoleSkillRequirement.role_id == r.id).all()
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
            eval_res = RoleMatcher.evaluate_role_suitability(req_dicts, skills_map)
            role_alignments[r.slug] = eval_res
            if r.name.lower() == target_role_name.lower():
                overall_readiness_val = eval_res["readiness_score"]

            # Upsert StudentRoleMatch
            match = db.query(StudentRoleMatch).filter(
                StudentRoleMatch.student_id == student_id,
                StudentRoleMatch.role_id == r.id
            ).first()
            if not match:
                match = StudentRoleMatch(
                    student_id=student_id,
                    role_id=r.id,
                    alignment_score=eval_res["alignment_score"],
                    readiness_score=eval_res["readiness_score"],
                    evidence_coverage=eval_res["evidence_coverage"],
                    strengths_json=json.dumps(eval_res["strengths"]),
                    gaps_json=json.dumps(eval_res["gaps"]),
                    explanation_text=eval_res["explanation"]
                )
                db.add(match)
            else:
                match.alignment_score = eval_res["alignment_score"]
                match.readiness_score = eval_res["readiness_score"]
                match.evidence_coverage = eval_res["evidence_coverage"]
                match.strengths_json = json.dumps(eval_res["strengths"])
                match.gaps_json = json.dumps(eval_res["gaps"])
                match.explanation_text = eval_res["explanation"]

        db.flush()

        # 7. Create immutable DigitalTwinSnapshot
        delta = round(prof - prev_score, 1)
        summary = ExplanationEngine.explain_twin_update(source_type, [skill_slug], {skill_slug: delta})

        snapshot = DigitalTwinSnapshot(
            student_id=student_id,
            model_version="v1.0.0-synapse",
            overall_readiness=overall_readiness_val,
            learning_velocity=velocity,
            consistency_score=conf,
            skill_state_json=json.dumps(skills_map),
            role_alignment_json=json.dumps(role_alignments),
            identified_bottlenecks_json=json.dumps(bottlenecks),
            identified_blindspots_json=json.dumps(blindspots),
            change_summary=summary,
            created_at=datetime.now(timezone.utc)
        )
        db.add(snapshot)

        # 8. Record TwinUpdateEvent
        event = TwinUpdateEvent(
            student_id=student_id,
            event_type=f"{source_type}_recorded",
            source_type=source_type,
            source_id=str(source_id),
            description=summary,
            affected_skills_json=json.dumps([skill_slug]),
            delta_summary_json=json.dumps({skill_slug: delta}),
            created_at=datetime.now(timezone.utc)
        )
        db.add(event)

        # 9. Record ActivityEvent
        act = ActivityEvent(
            student_id=student_id,
            event_type="assessment_submitted",
            title=f"Evidence Logged: {target_skill.name if target_skill else 'Skill'}",
            description=f"Demonstrated {normalized_score}% score via {source_type}.",
            metadata_json=json.dumps({"skill_slug": skill_slug, "delta": delta}),
            created_at=datetime.now(timezone.utc)
        )
        db.add(act)

        db.commit()

        return {
            "skill_slug": skill_slug,
            "new_proficiency": prof,
            "new_confidence": conf,
            "delta": delta,
            "overall_readiness": overall_readiness_val,
            "summary": summary
        }
