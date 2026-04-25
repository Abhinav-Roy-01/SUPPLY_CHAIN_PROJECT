"""
Router: Trips
CRUD for trips + status updates + P&L auto-calculation on delivery.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.services.pnl import calculate_trip_pnl
from app.services.eway_monitor import get_eway_status

router = APIRouter()

# ── Schemas ────────────────────────────────────────────────────────────────────

class TripCreateSchema(BaseModel):
    challan_id: str
    bilty_id: str
    truck_number: str
    driver_name: str
    origin: str
    destination: str
    freight_amount: float
    estimated_arrival: Optional[datetime] = None

class TripStatusUpdateSchema(BaseModel):
    status: str  # loaded, in_transit, at_toll, reached_destination, delivered, delayed
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None

class TripDeliverySchema(BaseModel):
    toll_expense: float = 0
    fuel_expense: float = 0
    driver_expense: float = 0
    other_expense: float = 0
    pod_photo_url: Optional[str] = None

# ── Mock Data ──────────────────────────────────────────────────────────────────

MOCK_TRIPS = [
    {
        "id": "TR-001",
        "challan_id": "CH-1001",
        "bilty_id": "BL-0892",
        "truck_number": "MH12AB1234",
        "driver_name": "RAVI KUMAR",
        "origin": "DELHI",
        "destination": "KANPUR",
        "status": "in_transit",
        "delay_probability": 0.74,
        "estimated_delay_hours": 2.5,
        "risk_level": "high",
        "delay_reason": "HEAVY RAIN ON NH19 CAUSING BOTTLENECK",
        "cascade_risk_count": 3,
        "current_lat": 27.4,
        "current_lng": 78.2,
        "freight_amount": 45000,
        "toll_expense": 0,
        "fuel_expense": 0,
        "driver_expense": 0,
        "other_expense": 0,
        "net_profit": None,
        "estimated_arrival": "2026-04-25T20:00:00",
        "started_at": "2026-04-25T09:00:00",
        "created_at": "2026-04-25T08:30:00"
    },
    {
        "id": "TR-002",
        "challan_id": "CH-1002",
        "bilty_id": "BL-0891",
        "truck_number": "KA01XY9876",
        "driver_name": "SURESH PATEL",
        "origin": "MUMBAI",
        "destination": "DELHI",
        "status": "in_transit",
        "delay_probability": 0.21,
        "estimated_delay_hours": 0,
        "risk_level": "low",
        "delay_reason": None,
        "cascade_risk_count": 0,
        "current_lat": 21.2,
        "current_lng": 73.9,
        "freight_amount": 62000,
        "toll_expense": 1800,
        "fuel_expense": 4200,
        "driver_expense": 1000,
        "other_expense": 0,
        "net_profit": None,
        "estimated_arrival": "2026-04-26T14:00:00",
        "started_at": "2026-04-24T22:00:00",
        "created_at": "2026-04-24T20:00:00"
    }
]

# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get("/")
async def list_trips():
    """List all active trips with risk scores."""
    return {
        "trips": MOCK_TRIPS,
        "total": len(MOCK_TRIPS),
        "high_risk_count": sum(1 for t in MOCK_TRIPS if t.get("risk_level") == "high"),
        "in_transit_count": sum(1 for t in MOCK_TRIPS if t.get("status") == "in_transit"),
    }

@router.get("/{trip_id}")
async def get_trip(trip_id: str):
    """Get full trip details."""
    trip = next((t for t in MOCK_TRIPS if t["id"] == trip_id), None)
    if not trip:
        raise HTTPException(status_code=404, detail=f"Trip {trip_id} not found")
    return trip

@router.post("/")
async def create_trip(trip: TripCreateSchema):
    """Create a new trip from a dispatched challan."""
    new_trip = {
        "id": f"TR-{len(MOCK_TRIPS) + 1:03d}",
        **trip.dict(),
        "status": "loaded",
        "delay_probability": None,
        "estimated_delay_hours": None,
        "risk_level": "unknown",
        "delay_reason": None,
        "cascade_risk_count": 0,
        "current_lat": None,
        "current_lng": None,
        "toll_expense": 0,
        "fuel_expense": 0,
        "driver_expense": 0,
        "other_expense": 0,
        "net_profit": None,
        "started_at": datetime.utcnow().isoformat(),
        "created_at": datetime.utcnow().isoformat()
    }
    MOCK_TRIPS.append(new_trip)
    return {"message": "TRIP CREATED SUCCESSFULLY", "trip": new_trip}

@router.patch("/{trip_id}/status")
async def update_trip_status(trip_id: str, update: TripStatusUpdateSchema):
    """Update trip GPS location and status."""
    valid_statuses = ["loaded", "in_transit", "at_toll", "reached_destination", "delivered", "delayed"]
    if update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    trip = next((t for t in MOCK_TRIPS if t["id"] == trip_id), None)
    if not trip:
        raise HTTPException(status_code=404, detail=f"Trip {trip_id} not found")
    trip["status"] = update.status
    if update.current_lat:
        trip["current_lat"] = update.current_lat
    if update.current_lng:
        trip["current_lng"] = update.current_lng
    return {"message": f"TRIP STATUS UPDATED TO {update.status.upper()}", "trip_id": trip_id}

@router.post("/{trip_id}/deliver")
async def complete_trip_delivery(trip_id: str, delivery: TripDeliverySchema):
    """
    Mark trip as delivered and auto-calculate P&L.
    Updates net_profit on the trip.
    """
    trip = next((t for t in MOCK_TRIPS if t["id"] == trip_id), None)
    if not trip:
        raise HTTPException(status_code=404, detail=f"Trip {trip_id} not found")

    pnl = calculate_trip_pnl(
        freight_amount=trip["freight_amount"],
        toll_expense=delivery.toll_expense,
        fuel_expense=delivery.fuel_expense,
        driver_expense=delivery.driver_expense,
        other_expense=delivery.other_expense,
    )

    trip["status"] = "delivered"
    trip["toll_expense"] = delivery.toll_expense
    trip["fuel_expense"] = delivery.fuel_expense
    trip["driver_expense"] = delivery.driver_expense
    trip["other_expense"] = delivery.other_expense
    trip["net_profit"] = pnl["net_profit"]
    trip["actual_arrival"] = datetime.utcnow().isoformat()
    if delivery.pod_photo_url:
        trip["pod_photo_url"] = delivery.pod_photo_url

    return {
        "message": "TRIP DELIVERED — P&L CALCULATED",
        "trip_id": trip_id,
        "pnl": pnl
    }
