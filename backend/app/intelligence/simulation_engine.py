import copy
from typing import Dict, Any, List
from app.intelligence.role_matcher import RoleMatcher

class SimulationEngine:
    @staticmethod
    def simulate_hypothetical_growth(
        current_skills_map: Dict[str, Dict[str, Any]],
        role_requirements: List[Dict[str, Any]],
        hypothetical_adjustments: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Runs an isolated hypothetical simulation.
        Never touches or mutates the underlying persistent models.
        """
        # Deepcopy to ensure zero mutation
        simulated_skills = copy.deepcopy(current_skills_map)

        # Baseline evaluation
        baseline_eval = RoleMatcher.evaluate_role_suitability(role_requirements, simulated_skills)

        unlocked_competencies = []
        for slug, hyp_score in hypothetical_adjustments.items():
            if slug in simulated_skills:
                prev_score = simulated_skills[slug].get("proficiency_score", 0.0)
                simulated_skills[slug]["proficiency_score"] = float(hyp_score)
                simulated_skills[slug]["confidence_score"] = max(simulated_skills[slug].get("confidence_score", 0.0), 85.0)
                if hyp_score >= 70.0 and prev_score < 70.0:
                    unlocked_competencies.append(slug)
            else:
                simulated_skills[slug] = {
                    "proficiency_score": float(hyp_score),
                    "confidence_score": 85.0,
                    "evidence_count": 3
                }
                if hyp_score >= 70.0:
                    unlocked_competencies.append(slug)

        # Simulated evaluation
        simulated_eval = RoleMatcher.evaluate_role_suitability(role_requirements, simulated_skills)

        delta_align = round(simulated_eval["alignment_score"] - baseline_eval["alignment_score"], 1)
        delta_readiness = round(simulated_eval["readiness_score"] - baseline_eval["readiness_score"], 1)

        rationale = (
            f"Simulated boost in {', '.join(hypothetical_adjustments.keys())} projected to elevate "
            f"role alignment by +{delta_align} pts and interview readiness by +{delta_readiness} pts."
        )

        return {
            "current_alignment": baseline_eval["alignment_score"],
            "projected_alignment": simulated_eval["alignment_score"],
            "delta_alignment": delta_align,
            "current_readiness": baseline_eval["readiness_score"],
            "projected_readiness": simulated_eval["readiness_score"],
            "delta_readiness": delta_readiness,
            "unlocked_competencies": unlocked_competencies,
            "rationale": rationale,
            "is_hypothetical": True
        }
