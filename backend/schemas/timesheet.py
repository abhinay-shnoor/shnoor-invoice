from pydantic import BaseModel
from datetime import date
from typing import Optional

class TimesheetBase(BaseModel):
    client_id: Optional[int] = None
    project: Optional[str] = None
    task: Optional[str] = None
    hours: float
    rate: float = 0.0
    status: str = "pending"
    date: date

class TimesheetCreate(TimesheetBase):
    pass

class TimesheetResponse(TimesheetBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
