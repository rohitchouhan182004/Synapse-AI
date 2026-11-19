from typing import List, Dict, Any

class BlindSpotDetector:
    @staticmethod
    def detect_blind_spots(student_skills: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Contrasts self-reported confidence against demonstrated assessment performance.
        Identifies overconfidence (blind spot) and underconfidence (impostor gap).
        """
        blind_spots = []
        for s in student_skills:
            self_rep = s.get("self_reported_score")
            assessed = s.get("assessed_score")
            name = s.get("name", s.get("slug", "Skill"))
            slug = s.get("slug", "skill")

            if self_rep is not None and assessed is not None:
                delta = float(self_rep) - float(assessed)
                if delta >= 20.0:
                    blind_spots.append({
                        "skill_name": name,
                        "skill_slug": slug,
                        "self_reported_score": float(self_rep),
                        "assessed_score": float(assessed),
                        "discrepancy": round(delta, 1),
                        "nature": "overestimation",
                        "explanation": f"You rated {name} at {self_rep}%, but practical assessments measure performance at {assessed}%. Edge-case precision requires attention."
                    })
                elif delta <= -20.0:
                    blind_spots.append({
                        "skill_name": name,
                        "skill_slug": slug,
                        "self_reported_score": float(self_rep),
                        "assessed_score": float(assessed),
                        "discrepancy": round(abs(delta), 1),
                        "nature": "underestimation",
                        "explanation": f"You reported low confidence ({self_rep}%) in {name}, but your assessment accuracy demonstrates strong proficiency ({assessed}%)."
                    })
        return blind_spots
