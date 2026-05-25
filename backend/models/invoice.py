from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from database import Base

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="SET NULL"), nullable=True)
    invoice_number = Column(String, index=True, nullable=False)
    date = Column(Date, nullable=False)
    due_date = Column(Date)
    status = Column(String, default="Pending") 
    subtotal = Column(Float, default=0.0)
    tax_rate = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    amount_paid = Column(Float, default=0.0)
    remaining_amount = Column(Float, default=0.0)
    notes = Column(String)
    items = Column(JSONB)

    user = relationship("User")
    client = relationship("Client")
    payments = relationship("InvoicePayment", back_populates="invoice", cascade="all, delete-orphan")
    logs = relationship("InvoiceLog", back_populates="invoice", cascade="all, delete-orphan")
