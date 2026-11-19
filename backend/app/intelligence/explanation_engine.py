from typing import List, Dict, Any

class ExplanationEngine:
    @staticmethod
    def explain_recommendation(
        target_role: str,
        priority_skill: str,
        current_score: float,
        target_score: float,
        bottleneck_info: Dict[str, Any] | None = None
    ) -> Dict[str, str]:
        gap = round(target_score - current_score, 1)
        if bottleneck_info:
            headline = f"Resolve foundational bottleneck in {priority_skill}"
            rationale = (
                f"Your performance in {priority_skill} ({current_score}%) directly impedes higher-level progress in "
                f"{', '.join(bottleneck_info.get('affected_dependents', []))}. Unblocking this unlocks maximum readiness velocity for {target_role}."
            )
        else:
            headline = f"Accelerate {priority_skill} to target proficiency ({target_score}%)"
            rationale = (
                f"{priority_skill} carries high weight for {target_role}. Closing the current {gap}-point gap "
                f"will provide the single largest increase in verified role alignment."
            )

        return {
            "headline": headline,
            "action": f"Dedicate 45 minutes to high-difficulty {priority_skill} exercises.",
            "rationale": rationale
        }

    @staticmethod
    def explain_twin_update(event_type: str, affected_skills: List[str], deltas: Dict[str, float]) -> str:
        parts = []
        for s in affected_skills:
            d = deltas.get(s, 0.0)
            sign = "+" if d >= 0 else ""
            parts.append(f"{s} ({sign}{d} pts)")
        return f"Digital Twin recalibrated via {event_type}. Updated competencies: {', '.join(parts)}."
