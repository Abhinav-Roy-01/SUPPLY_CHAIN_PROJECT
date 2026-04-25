import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Date, ForeignKey
from datetime import datetime
from app.database import Base
from app.models.core import generate_uuid

class TripMLFeature(Base):
    __tablename__ = "trip_ml_features"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    trip_id = Column(String(36), ForeignKey("trips.id"))
    route_distance_km = Column(Float)
    truck_age_days = Column(Integer)
    truck_health_score = Column(Integer)
    driver_delay_rate = Column(Float)
    weather_rain_mm = Column(Float)
    weather_wind_kmh = Column(Float)
    is_night_trip = Column(Boolean)
    is_friday = Column(Boolean)
    historical_route_delay_rate = Column(Float)
    fastag_balance = Column(Float)
    
    # Labels
    was_delayed = Column(Boolean)
    actual_delay_hours = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class RouteAnalytics(Base):
    __tablename__ = "route_analytics"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    route_id = Column(String(36), ForeignKey("routes.id"))
    period_start = Column(Date)
    period_end = Column(Date)
    trip_count = Column(Integer)
    avg_freight = Column(Float)
    avg_toll = Column(Float)
    avg_fuel = Column(Float)
    avg_driver_cost = Column(Float)
    avg_profit = Column(Float)
    avg_delay_hours = Column(Float)
    delay_rate = Column(Float)
    computed_at = Column(DateTime, default=datetime.utcnow)
