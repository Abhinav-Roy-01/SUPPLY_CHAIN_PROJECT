import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Date, ForeignKey, Text, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(200), nullable=False)
    address = Column(Text)
    gst = Column(String(15))
    pan = Column(String(10))
    phone = Column(String(15))
    created_at = Column(DateTime, default=datetime.utcnow)

    trucks = relationship("Truck", back_populates="company")
    drivers = relationship("Driver", back_populates="company")

class Truck(Base):
    __tablename__ = "trucks"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    company_id = Column(String(36), ForeignKey("companies.id"))
    vehicle_number = Column(String(20), unique=True, nullable=False)
    make = Column(String(50))
    model = Column(String(50))
    capacity_quintal = Column(Float)
    rc_expiry = Column(Date)
    insurance_expiry = Column(Date)
    permit_expiry = Column(Date)
    last_maintenance = Column(Date)
    tyre_age_km = Column(Integer, default=0)
    engine_hours = Column(Integer, default=0)
    breakdown_count = Column(Integer, default=0)
    health_score = Column(Integer) # 0-100
    health_updated_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="trucks")

class Driver(Base):
    __tablename__ = "drivers"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    company_id = Column(String(36), ForeignKey("companies.id"))
    name = Column(String(100), nullable=False)
    phone = Column(String(15))
    license_number = Column(String(20))
    license_expiry = Column(Date)
    trip_count = Column(Integer, default=0)
    delay_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="drivers")

class Party(Base):
    __tablename__ = "parties"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    company_id = Column(String(36), ForeignKey("companies.id"))
    name = Column(String(200), nullable=False)
    type = Column(String(20)) # consignor, consignee, both
    gst = Column(String(15))
    phone = Column(String(15))
    address = Column(Text)
    outstanding_balance = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        CheckConstraint(type.in_(['consignor', 'consignee', 'both'])),
    )

class Route(Base):
    __tablename__ = "routes"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    company_id = Column(String(36), ForeignKey("companies.id"))
    origin = Column(String(100), nullable=False)
    destination = Column(String(100), nullable=False)
    distance_km = Column(Float)
    standard_freight_rate = Column(Float)
    avg_duration_hours = Column(Float)
    avg_delay_rate = Column(Float)
    avg_profit_30d = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class Bilty(Base):
    __tablename__ = "bilties"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    company_id = Column(String(36), ForeignKey("companies.id"))
    bilty_number = Column(String(20), unique=True, nullable=False)
    consignor_id = Column(String(36), ForeignKey("parties.id"))
    consignee_id = Column(String(36), ForeignKey("parties.id"))
    route_id = Column(String(36), ForeignKey("routes.id"))
    origin = Column(String(100))
    destination = Column(String(100))
    goods_description = Column(Text)
    weight_quintal = Column(Float)
    freight_amount = Column(Float)
    labour_charge = Column(Float)
    gr_charge = Column(Float)
    door_delivery_charge = Column(Float, default=0)
    platform_charge = Column(Float, default=0)
    total_amount = Column(Float)
    eway_bill_number = Column(String(20))
    eway_bill_generated_at = Column(DateTime)
    eway_bill_expires_at = Column(DateTime)
    eway_bill_validity_km = Column(Float)
    status = Column(String(20), default='draft') # draft, active, challan_done, delivered
    is_door_delivery = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint(status.in_(['draft', 'active', 'challan_done', 'delivered'])),
    )

class Challan(Base):
    __tablename__ = "challans"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    bilty_id = Column(String(36), ForeignKey("bilties.id"))
    challan_number = Column(String(20), unique=True, nullable=False)
    truck_id = Column(String(36), ForeignKey("trucks.id"))
    driver_id = Column(String(36), ForeignKey("drivers.id"))
    truck_health_score_at_dispatch = Column(Integer)
    dispatched_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

class Trip(Base):
    __tablename__ = "trips"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    challan_id = Column(String(36), ForeignKey("challans.id"))
    bilty_id = Column(String(36), ForeignKey("bilties.id"))
    truck_id = Column(String(36), ForeignKey("trucks.id"))
    driver_id = Column(String(36), ForeignKey("drivers.id"))
    route_id = Column(String(36), ForeignKey("routes.id"))
    status = Column(String(30), default='loaded')
    
    # ML risk fields
    delay_probability = Column(Float)
    estimated_delay_hours = Column(Float)
    delay_reason = Column(Text)
    risk_score = Column(Integer)
    cascade_risk_count = Column(Integer, default=0)
    
    # Tracking
    started_at = Column(DateTime)
    estimated_arrival = Column(DateTime)
    actual_arrival = Column(DateTime)
    current_lat = Column(Float)
    current_lng = Column(Float)
    driver_state = Column(String(30))
    pod_photo_url = Column(Text)
    
    # Financial
    freight_amount = Column(Float)
    toll_expense = Column(Float, default=0)
    fuel_expense = Column(Float, default=0)
    driver_expense = Column(Float, default=0)
    other_expense = Column(Float, default=0)
    net_profit = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint(status.in_(['loaded', 'in_transit', 'at_toll', 'reached_destination', 'delivered', 'delayed'])),
    )
