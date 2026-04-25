import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Date, ForeignKey, Text, CheckConstraint
from datetime import datetime
from app.database import Base
from app.models.core import generate_uuid

class Expense(Base):
    __tablename__ = "expenses"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    company_id = Column(String(36), ForeignKey("companies.id"))
    trip_id = Column(String(36), ForeignKey("trips.id"))
    truck_id = Column(String(36), ForeignKey("trucks.id"))
    type = Column(String(30))
    amount = Column(Float)
    description = Column(Text)
    expense_date = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint(type.in_(['fuel', 'toll', 'driver_salary', 'maintenance', 'tyre', 'permit', 'insurance', 'fine', 'other'])),
    )

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    company_id = Column(String(36), ForeignKey("companies.id"))
    entity_type = Column(String(20)) # truck, driver
    entity_id = Column(String(36))
    doc_type = Column(String(30))
    file_url = Column(Text)
    expiry_date = Column(Date)
    alert_sent_30d = Column(Boolean, default=False)
    alert_sent_7d = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint(entity_type.in_(['truck', 'driver'])),
        CheckConstraint(doc_type.in_(['rc', 'insurance', 'permit', 'license', 'fitness', 'pollution'])),
    )

class LedgerEntry(Base):
    __tablename__ = "ledger_entries"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    party_id = Column(String(36), ForeignKey("parties.id"))
    bilty_id = Column(String(36), ForeignKey("bilties.id"))
    type = Column(String(10)) # debit, credit
    amount = Column(Float)
    description = Column(Text)
    payment_mode = Column(String(20))
    entry_date = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint(type.in_(['debit', 'credit'])),
    )
