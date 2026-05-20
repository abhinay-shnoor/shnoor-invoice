from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TaxFilingBase(BaseModel):
    filing_month: str
    gst_amount: float
    status: str = "pending"

class TaxFilingCreate(TaxFilingBase):
    pass

class TaxFilingResponse(TaxFilingBase):
    id: int
    user_id: int
    submitted_at: Optional[datetime] = None

    class Config:
        from_attributes = True
