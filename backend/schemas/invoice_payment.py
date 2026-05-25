from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class InvoicePaymentBase(BaseModel):
    amount: float
    payment_date: date
    payment_method: str
    transaction_id: Optional[str] = None
    notes: Optional[str] = None

class InvoicePaymentCreate(InvoicePaymentBase):
    pass

class InvoicePaymentResponse(InvoicePaymentBase):
    id: int
    invoice_id: int
    created_at: datetime

    class Config:
        from_attributes = True
