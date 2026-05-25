from pydantic import BaseModel
from datetime import date
from typing import Optional, List, Dict, Any
from schemas.invoice_payment import InvoicePaymentResponse
from schemas.invoice_log import InvoiceLogResponse

class InvoiceBase(BaseModel):
    client_id: Optional[int] = None
    invoice_number: str
    date: date
    due_date: Optional[date] = None
    status: str = "Pending"
    subtotal: float = 0.0
    tax_rate: float = 0.0
    tax_amount: float = 0.0
    total: float = 0.0
    amount_paid: float = 0.0
    remaining_amount: float = 0.0
    notes: Optional[str] = None
    items: Optional[List[Dict[str, Any]]] = None

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceUpdate(BaseModel):
    client_id: Optional[int] = None
    status: Optional[str] = None
    subtotal: Optional[float] = None
    tax_rate: Optional[float] = None
    tax_amount: Optional[float] = None
    total: Optional[float] = None
    amount_paid: Optional[float] = None
    remaining_amount: Optional[float] = None
    due_date: Optional[date] = None
    notes: Optional[str] = None
    items: Optional[List[Dict[str, Any]]] = None

class InvoiceResponse(InvoiceBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class InvoiceDetailResponse(InvoiceResponse):
    payments: List[InvoicePaymentResponse] = []
    logs: List[InvoiceLogResponse] = []
