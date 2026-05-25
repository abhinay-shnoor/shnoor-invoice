from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class InvoiceLogBase(BaseModel):
    action: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None

class InvoiceLogResponse(InvoiceLogBase):
    id: int
    invoice_id: int
    user_id: Optional[int]
    timestamp: datetime

    class Config:
        from_attributes = True
