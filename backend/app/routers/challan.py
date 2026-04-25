"""
Router: Challan
Create challans linked to bilties. Triggers truck health check on dispatch.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.services.health_scorer import compute_health_score

router = APIRouter()

# ── Schemas ────────────────────────────────────────────────────────────────────

class ChallanCreateSchema(BaseModel):
    bilty_id: str
    challan_number: str
    truck_number: str
    driver_name: str
    driver_license: Optional[str] = None
    freight_advance: float = 0
    # Truck health inputs for pre-dispatch check
    last_maintenance_days_ago: Optional[int] = None
    tyre_age_km: int = 0
    engine_hours: int = 0
    breakdown_count: int = 0

# ── Mock Data ──────────────────────────────────────────────────────────────────

MOCK_CHALLANS = []

# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get("/")
async def list_challans():
    """List all challans."""
    return {"challans": MOCK_CHALLANS, "total": len(MOCK_CHALLANS)}

@router.get("/{challan_id}")
async def get_challan(challan_id: str):
    """Get a single challan by ID."""
    challan = next((c for c in MOCK_CHALLANS if c["id"] == challan_id), None)
    if not challan:
        raise HTTPException(status_code=404, detail=f"Challan {challan_id} not found")
    return challan

@router.post("/")
async def create_challan(challan: ChallanCreateSchema):
    """
    Create a challan for a bilty.
    Automatically runs truck health check and returns score before dispatch.
    """
    from datetime import date, timedelta

    # Compute truck health score
    last_maint = None
    if challan.last_maintenance_days_ago is not None:
        last_maint = date.today() - timedelta(days=challan.last_maintenance_days_ago)

    health_result = compute_health_score(
        last_maintenance=last_maint,
        tyre_age_km=challan.tyre_age_km,
        engine_hours=challan.engine_hours,
        breakdown_count=challan.breakdown_count,
        rc_expiry=None,
        insurance_expiry=None,
        permit_expiry=None,
    )

    new_challan = {
        "id": f"CH-{len(MOCK_CHALLANS) + 1001}",
        "bilty_id": challan.bilty_id,
        "challan_number": challan.challan_number,
        "truck_number": challan.truck_number,
        "driver_name": challan.driver_name,
        "driver_license": challan.driver_license,
        "freight_advance": challan.freight_advance,
        "truck_health_score_at_dispatch": health_result["health_score"],
        "health_risk_level": health_result["risk_level"],
        "health_factors": health_result["factors"],
        "dispatched_at": datetime.utcnow().isoformat(),
        "created_at": datetime.utcnow().isoformat()
    }
    MOCK_CHALLANS.append(new_challan)

    return {
        "message": "CHALLAN CREATED SUCCESSFULLY",
        "challan": new_challan,
        "truck_health_check": health_result,
        "dispatch_warning": "HIGH RISK — CONSIDER MAINTENANCE BEFORE DISPATCH" if health_result["risk_level"] == "high" else None
    }
