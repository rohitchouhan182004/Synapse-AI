from datetime import datetime
from typing import List, Dict, Any

class LearningAnalyzer:
    @staticmethod
    def calculate_velocity(history_scores: List[Dict[str, Any]]) -> float:
        """Calculates score rate-of-change over attempts."""
        if len(history_scores) < 2:
            return 0.0
        scores = [h["score"] for h in history_scores]
        # Linear slope approximation
        deltas = [scores[i] - scores[i-1] for i in range(1, len(scores))]
        avg_velocity = sum(deltas) / len(deltas)
        return round(avg_velocity, 2)

    @staticmethod
    def calculate_retention(initial_score: float, follow_up_score: float, days_gap: int) -> Dict[str, Any]:
        """Calculates retention percentage and decay status."""
        if initial_score <= 0:
            return {"retention_rate": 0.0, "status": "unknown"}
        
        ratio = follow_up_score / initial_score
        retention_pct = round(min(100.0, ratio * 100.0), 1)
        
        status = "high"
        if retention_pct < 60.0:
            status = "decayed"
        elif retention_pct < 80.0:
            status = "moderate"
            
        return {
            "retention_rate": retention_pct,
            "days_elapsed": days_gap,
            "status": status,
            "reinforcement_needed": retention_pct < 75.0
        }

    @staticmethod
    def extract_mistake_patterns(submissions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        mistake_counts: Dict[str, int] = {}
        for sub in submissions:
            mistakes = sub.get("detected_mistakes", [])
            for m in mistakes:
                mistake_counts[m] = mistake_counts.get(m, 0) + 1

        patterns = []
        for mistake, count in mistake_counts.items():
            if count >= 2:
                patterns.append({
                    "mistake": mistake,
                    "frequency": count,
                    "impact": "recurring_flaw",
                    "remedy": f"Targeted deliberate practice on conceptual edge-cases for '{mistake}'."
                })
        return sorted(patterns, key=lambda p: p["frequency"], reverse=True)
