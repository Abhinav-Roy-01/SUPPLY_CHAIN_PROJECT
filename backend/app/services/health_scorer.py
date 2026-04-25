"""
Service: Truck Health Scorer
Computes a 0-100 health score from truck maintenance data.
"""
from datetime import date, datetime
from typing import Optional

def compute_health_score(
    last_maintenance: Optional[date],
    tyre_age_km: int,
    engine_hours: int,
    breakdown_count: int,
    rc_expiry: Optional[date],
    insurance_expiry: Optional[date],
    permit_expiry: Optional[date],
) -> dict:
    """
    Computes truck health score (0-100) from maintenance indicators.
    Returns score + individual factor breakdown.
    """
    today = date.today()
    score = 100
    factors = []

    # --- Maintenance age penalty ---
    if last_maintenance:
        days_since = (today - last_maintenance).days
        if days_since > 90:
            penalty = min(30, (days_since - 90) // 3)
            score -= penalty
            factors.append(f"LAST MAINTENANCE {days_since}D AGO (-{penalty})")
        elif days_since > 45:
            score -= 10
            factors.append(f"MAINTENANCE DUE SOON ({days_since}D AGO -10)")
    else:
        score -= 20
        factors.append("NO MAINTENANCE RECORD (-20)")

    # --- Tyre age penalty ---
    if tyre_age_km > 80000:
        score -= 20
        factors.append(f"TYRE WORN: {tyre_age_km}KM (-20)")
    elif tyre_age_km > 50000:
        score -= 10
        factors.append(f"TYRE AGING: {tyre_age_km}KM (-10)")

    # --- Engine hours penalty ---
    if engine_hours > 15000:
        score -= 15
        factors.append(f"HIGH ENGINE HOURS: {engine_hours}HR (-15)")
    elif engine_hours > 10000:
        score -= 5
        factors.append(f"ENGINE HOURS ELEVATED: {engine_hours}HR (-5)")

    # --- Breakdown history ---
    if breakdown_count >= 3:
        penalty = min(20, breakdown_count * 5)
        score -= penalty
        factors.append(f"{breakdown_count} BREAKDOWNS RECORDED (-{penalty})")

    # --- Document expiry penalties ---
    for label, expiry in [("RC", rc_expiry), ("INSURANCE", insurance_expiry), ("PERMIT", permit_expiry)]:
        if expiry:
            days_left = (expiry - today).days
            if days_left < 0:
                score -= 15
                factors.append(f"{label} EXPIRED (-15)")
            elif days_left < 30:
                score -= 5
                factors.append(f"{label} EXPIRING IN {days_left}D (-5)")

    score = max(0, min(100, score))

    if score >= 80:
        risk_level = "low"
    elif score >= 55:
        risk_level = "medium"
    else:
        risk_level = "high"

    return {
        "health_score": score,
        "risk_level": risk_level,
        "factors": factors
    }
