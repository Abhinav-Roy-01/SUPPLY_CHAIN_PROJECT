"""
Router: Morning Briefing
Returns a daily fleet summary for the operator dashboard.
"""
from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/")
async def get_morning_briefing():
    """
    Generate a daily morning briefing with fleet health, risk alerts, and P&L summary.
    In production, this would pull live data from the database.
    """
    today = datetime.utcnow().strftime("%d %B %Y")

    return {
        "date": today,
        "generated_at": datetime.utcnow().isoformat(),
        "summary": {
            "total_active_trips": 5,
            "high_risk_trips": 2,
            "trucks_needing_maintenance": 1,
            "eway_bills_expiring_today": 1,
            "total_freight_today": 245000,
            "estimated_profit_today": 38000,
        },
        "alerts": [
            {
                "level": "critical",
                "message": "TRIP TR-001 (MH12AB1234) — 74% DELAY RISK ON NH19. RECOMMEND REROUTE VIA NH58.",
                "action": "SIMULATE REROUTE",
                "trip_id": "TR-001"
            },
            {
                "level": "warning",
                "message": "E-WAY BILL EW-2024-88821 ON BL-0892 EXPIRES IN 4 HOURS.",
                "action": "EXTEND OR EXPEDITE",
                "bilty_id": "BL-0892"
            },
            {
                "level": "info",
                "message": "TRUCK KA01XY9876 DUE FOR MAINTENANCE — HEALTH SCORE 58/100.",
                "action": "SCHEDULE MAINTENANCE",
                "truck_number": "KA01XY9876"
            }
        ],
        "top_routes_today": [
            {"route": "DELHI → KANPUR", "trips": 2, "avg_delay_risk": "HIGH"},
            {"route": "MUMBAI → DELHI", "trips": 1, "avg_delay_risk": "LOW"},
            {"route": "AHMEDABAD → MUMBAI", "trips": 1, "avg_delay_risk": "LOW"},
        ],
        "copilot_tip": "RAIN IS FORECAST ON NH19 UNTIL 6PM. RECOMMEND DELAYING 2 DELHI-KANPUR LOADS OR REROUTING VIA NH58."
    }
