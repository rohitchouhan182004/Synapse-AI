import math
from typing import List

class ConfidenceEngine:
    @staticmethod
    def calculate_confidence(evidence_list: List[dict]) -> float:
        if not evidence_list:
            return 0.0

        n = len(evidence_list)
        # Factor 1: Evidence Count saturation (diminishing returns via log curve, saturated at ~8 evidences)
        count_factor = min(1.0, math.log(n + 1) / math.log(9))

        # Factor 2: Source Diversity (coding, interview, practical, self_reported)
        unique_sources = set(e.get("source_type") for e in evidence_list)
        diversity_factor = min(1.0, len(unique_sources) / 3.0)

        # Factor 3: Average Evidence Quality & Weight
        qualities = [e.get("evidence_quality", 1.0) * e.get("difficulty_weight", 1.0) for e in evidence_list]
        quality_factor = min(1.0, sum(qualities) / max(1, len(qualities)))

        # Factor 4: Consistency / variance penalty
        scores = [e.get("normalized_score", 0.0) for e in evidence_list]
        if len(scores) > 1:
            mean = sum(scores) / len(scores)
            variance = sum((s - mean) ** 2 for s in scores) / len(scores)
            std_dev = math.sqrt(variance)
            # Higher variance reduces confidence slightly (std_dev up to 30)
            consistency_penalty = min(0.25, (std_dev / 100.0) * 0.5)
        else:
            consistency_penalty = 0.15  # Single evidence has natural uncertainty

        raw_confidence = (0.45 * count_factor + 0.35 * diversity_factor + 0.20 * quality_factor) - consistency_penalty
        return round(max(5.0, min(98.0, raw_confidence * 100.0)), 1)
