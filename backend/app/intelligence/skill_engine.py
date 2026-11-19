from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple
from app.intelligence.confidence_engine import ConfidenceEngine

SOURCE_BASE_WEIGHTS = {
    "practical_task": 1.00,
    "coding_assessment": 0.95,
    "interview": 0.85,
    "learning_activity": 0.35,
    "self_reported": 0.15,
}

class SkillEngine:
    @staticmethod
    def calculate_skill_state(
        evidences: List[Dict[str, Any]],
        self_reported: float | None = None
    ) -> Tuple[float, float, str, float]:
        if not evidences:
            if self_reported is not None:
                # Solely self-reported: conservative low confidence
                return round(float(self_reported), 1), 15.0, "stable", 0.0
            return 0.0, 0.0, "stable", 0.0

        total_weight = 0.0
        weighted_score_sum = 0.0
        chrono_evidences = sorted(evidences, key=lambda e: e.get("created_at") or datetime.min)

        for i, ev in enumerate(chrono_evidences):
            st = ev.get("source_type", "coding_assessment")
            base_w = SOURCE_BASE_WEIGHTS.get(st, 0.5)
            diff_w = float(ev.get("difficulty_weight", 1.0))
            qual_w = float(ev.get("evidence_quality", 1.0))
            
            # Recency progression: more recent assessments carry up to 25% higher weight
            recency_multiplier = 0.85 + (0.30 * (i / max(1, len(chrono_evidences) - 1)))
            effective_weight = base_w * diff_w * qual_w * recency_multiplier

            total_weight += effective_weight
            weighted_score_sum += effective_weight * float(ev.get("normalized_score", 0.0))

        if total_weight <= 0:
            proficiency = 0.0
        else:
            proficiency = weighted_score_sum / total_weight

        # Confidence from multi-factor confidence engine
        confidence = ConfidenceEngine.calculate_confidence(evidences)

        # Trend direction and velocity
        trend_direction = "stable"
        velocity = 0.0
        if len(chrono_evidences) >= 2:
            first_half = chrono_evidences[:len(chrono_evidences)//2]
            second_half = chrono_evidences[len(chrono_evidences)//2:]
            avg_1 = sum(e.get("normalized_score", 0.0) for e in first_half) / max(1, len(first_half))
            avg_2 = sum(e.get("normalized_score", 0.0) for e in second_half) / max(1, len(second_half))
            diff = avg_2 - avg_1
            velocity = round(diff, 1)
            if diff > 4.0:
                trend_direction = "improving"
            elif diff < -4.0:
                trend_direction = "declining"

        return round(max(0.0, min(100.0, proficiency)), 1), confidence, trend_direction, velocity
