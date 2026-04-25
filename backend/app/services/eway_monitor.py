"""
Service: E-Way Bill State Machine
Monitors E-Way Bill expiry and returns status + urgency level.
"""
from datetime import datetime, timezone
from typing import Optional

def get_eway_status(eway_expires_at: Optional[datetime]) -> dict:
    """
    Returns the E-Way Bill status based on remaining hours.
    States: valid, warning (6hr), urgent (2hr), expired
    """
    if not eway_expires_at:
        return {"status": "no_eway", "label": "NO E-WAY BILL", "hours_remaining": None, "color": "gray"}

    now = datetime.now(timezone.utc)
    # Make eway_expires_at timezone-aware if it isn't
    if eway_expires_at.tzinfo is None:
        eway_expires_at = eway_expires_at.replace(tzinfo=timezone.utc)

    diff = eway_expires_at - now
    hours_remaining = diff.total_seconds() / 3600

    if hours_remaining <= 0:
        return {
            "status": "expired",
            "label": "EXPIRED — ₹10K FINE",
            "hours_remaining": round(hours_remaining, 1),
            "color": "red"
        }
    elif hours_remaining <= 2:
        return {
            "status": "urgent",
            "label": f"URGENT — {hours_remaining:.1f}HR LEFT",
            "hours_remaining": round(hours_remaining, 1),
            "color": "red"
        }
    elif hours_remaining <= 6:
        return {
            "status": "warning",
            "label": f"WARNING — {hours_remaining:.1f}HR LEFT",
            "hours_remaining": round(hours_remaining, 1),
            "color": "amber"
        }
    else:
        return {
            "status": "valid",
            "label": f"VALID — {hours_remaining:.1f}HR LEFT",
            "hours_remaining": round(hours_remaining, 1),
            "color": "green"
        }
