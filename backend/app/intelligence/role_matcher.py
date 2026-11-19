from typing import List, Dict, Any, Tuple

class RoleMatcher:
    @staticmethod
    def evaluate_role_suitability(
        role_requirements: List[Dict[str, Any]],
        student_skills_map: Dict[str, Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        role_requirements item: {
            skill_slug: str,
            skill_name: str,
            importance_weight: float,
            expected_proficiency: float,
            is_mandatory: bool
        }
        """
        if not role_requirements:
            return {
                "alignment_score": 0.0,
                "readiness_score": 0.0,
                "evidence_coverage": 0.0,
                "strengths": [],
                "gaps": [],
                "explanation": "No requirements configured for this role."
            }

        total_weighted_points = 0.0
        max_possible_points = 0.0
        assessed_skills_count = 0
        strengths = []
        gaps = []

        total_confidence_weight = 0.0

        for req in role_requirements:
            slug = req["skill_slug"]
            weight = float(req.get("importance_weight", 1.0))
            expected = float(req.get("expected_proficiency", 70.0))
            is_mandatory = req.get("is_mandatory", True)

            student_data = student_skills_map.get(slug, {})
            current_score = float(student_data.get("proficiency_score", 0.0))
            current_confidence = float(student_data.get("confidence_score", 0.0))
            evidence_count = int(student_data.get("evidence_count", 0))

            if evidence_count > 0:
                assessed_skills_count += 1

            # Ratio of demonstrated proficiency to expected
            capped_ratio = min(1.2, current_score / max(1.0, expected))
            earned_points = weight * capped_ratio * (0.8 + 0.2 * (current_confidence / 100.0))
            total_weighted_points += earned_points
            max_possible_points += weight * 1.0
            total_confidence_weight += weight * (current_confidence / 100.0)

            # Categorize
            if current_score >= expected:
                strengths.append(req["skill_name"])
            elif current_score < expected * 0.7 or (is_mandatory and current_score < expected * 0.85):
                gaps.append({
                    "skill_name": req["skill_name"],
                    "current": current_score,
                    "target": expected,
                    "is_mandatory": is_mandatory,
                    "delta": round(expected - current_score, 1)
                })

        alignment = (total_weighted_points / max(0.01, max_possible_points)) * 100.0
        coverage = (assessed_skills_count / len(role_requirements)) * 100.0
        avg_confidence = (total_confidence_weight / max(0.01, max_possible_points)) * 100.0

        # Readiness is alignment attenuated by evidence certainty and mandatory gaps
        mandatory_gap_penalty = min(25.0, sum(5.0 for g in gaps if g.get("is_mandatory")))
        readiness = (alignment * (0.6 + 0.4 * (avg_confidence / 100.0))) - mandatory_gap_penalty

        return {
            "alignment_score": round(max(0.0, min(100.0, alignment)), 1),
            "readiness_score": round(max(0.0, min(100.0, readiness)), 1),
            "evidence_coverage": round(max(0.0, min(100.0, coverage)), 1),
            "strengths": strengths[:4],
            "gaps": [g["skill_name"] for g in gaps][:4],
            "gap_details": gaps,
            "explanation": f"Role alignment is {round(alignment, 1)}% based on {assessed_skills_count}/{len(role_requirements)} validated domains."
        }
