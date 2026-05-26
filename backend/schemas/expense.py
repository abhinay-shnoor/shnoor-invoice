from pydantic import BaseModel
import datetime
from typing import Optional

class ExpenseBase(BaseModel):
    title: str
    category: Optional[str] = None
    amount: float
    date: datetime.date
    vendor: Optional[str] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None
    status: str = "Pending"

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[datetime.date] = None
    vendor: Optional[str] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class ExpenseResponse(ExpenseBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
