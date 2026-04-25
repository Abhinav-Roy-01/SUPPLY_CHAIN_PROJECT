"""
Router: Bilty (Lorry Receipt)
CRUD + E-Way Bill status monitoring.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.services.eway_monitor import get_eway_status

router = APIRouter()

# ── Schemas ────────────────────────────────────────────────────────────────────

class BiltyCreateSchema(BaseModel):
    bilty_number: str
    origin: str
    destination: str
    goods_description: str
    weight_quintal: float
    freight_amount: float
    labour_charge: float = 0
    gr_charge: float = 0
    door_delivery_charge: float = 0
    platform_charge: float = 0
    eway_bill_number: Optional[str] = None
    eway_bill_expires_at: Optional[datetime] = None
    consignor_name: Optional[str] = None
    consignee_name: Optional[str] = None

class BiltyUpdateStatusSchema(BaseModel):
    status: str  # draft, active, challan_done, delivered

# ── Mock Data (until DB is live) ───────────────────────────────────────────────

MOCK_BILTIES = [
    {
        "id": "BL-0892",
        "bilty_number": "BL-0892",
        "origin": "DELHI",
        "destination": "KANPUR",
        "goods_description": "STEEL PIPES",
        "weight_quintal": 120,
        "freight_amount": 45000,
        "labour_charge": 500,
        "gr_charge": 100,
        "total_amount": 45600,
        "eway_bill_number": "EW-2024-88821",
        "eway_bill_expires_at": "2026-04-26T10:00:00",
        "status": "active",
        "created_at": "2026-04-25T08:00:00"
    },
    {
        "id": "BL-0891",
        "bilty_number": "BL-0891",
        "origin": "MUMBAI",
        "destination": "DELHI",
        "goods_description": "COTTON BALES",
        "weight_quintal": 80,
        "freight_amount": 62000,
        "labour_charge": 800,
        "gr_charge": 150,
        "total_amount": 62950,
        "eway_bill_number": "EW-2024-88820",
        "eway_bill_expires_at": "2026-04-25T18:00:00",
        "status": "challan_done",
        "created_at": "2026-04-24T14:00:00"
    }
]

# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get("/")
async def list_bilties():
    """List all bilties with live E-Way Bill status."""
    result = []
    for b in MOCK_BILTIES:
        bilty = dict(b)
        expiry = datetime.fromisoformat(b["eway_bill_expires_at"]) if b.get("eway_bill_expires_at") else None
        bilty["eway_status"] = get_eway_status(expiry)
        result.append(bilty)
    return {"bilties": result, "total": len(result)}

@router.get("/{bilty_id}")
async def get_bilty(bilty_id: str):
    """Get a single bilty by ID with E-Way status."""
    bilty = next((b for b in MOCK_BILTIES if b["id"] == bilty_id), None)
    if not bilty:
        raise HTTPException(status_code=404, detail=f"Bilty {bilty_id} not found")
    result = dict(bilty)
    expiry = datetime.fromisoformat(bilty["eway_bill_expires_at"]) if bilty.get("eway_bill_expires_at") else None
    result["eway_status"] = get_eway_status(expiry)
    return result

@router.post("/")
async def create_bilty(bilty: BiltyCreateSchema):
    """Create a new Bilty (Lorry Receipt)."""
    total = (
        bilty.freight_amount + bilty.labour_charge +
        bilty.gr_charge + bilty.door_delivery_charge + bilty.platform_charge
    )
    new_bilty = {
        **bilty.dict(),
        "id": f"BL-{len(MOCK_BILTIES) + 900}",
        "total_amount": total,
        "status": "draft",
        "created_at": datetime.utcnow().isoformat()
    }
    MOCK_BILTIES.append(new_bilty)
    return {"message": "BILTY CREATED SUCCESSFULLY", "bilty": new_bilty}

@router.patch("/{bilty_id}/status")
async def update_bilty_status(bilty_id: str, update: BiltyUpdateStatusSchema):
    """Update bilty status through the lifecycle: draft → active → challan_done → delivered."""
    valid_statuses = ["draft", "active", "challan_done", "delivered"]
    if update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    bilty = next((b for b in MOCK_BILTIES if b["id"] == bilty_id), None)
    if not bilty:
        raise HTTPException(status_code=404, detail=f"Bilty {bilty_id} not found")
    bilty["status"] = update.status
    return {"message": f"BILTY STATUS UPDATED TO {update.status.upper()}", "bilty_id": bilty_id, "status": update.status}

@router.get("/{bilty_id}/eway-status")
async def get_eway_bill_status(bilty_id: str):
    """Get E-Way Bill status: valid / warning / urgent / expired."""
    bilty = next((b for b in MOCK_BILTIES if b["id"] == bilty_id), None)
    if not bilty:
        raise HTTPException(status_code=404, detail=f"Bilty {bilty_id} not found")
    expiry = datetime.fromisoformat(bilty["eway_bill_expires_at"]) if bilty.get("eway_bill_expires_at") else None
    return {
        "bilty_id": bilty_id,
        "eway_bill_number": bilty.get("eway_bill_number"),
        **get_eway_status(expiry)
    }
