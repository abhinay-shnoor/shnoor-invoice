from pydantic import BaseModel
from datetime import datetime

class AuditLogBase(BaseModel):
    action: str

class AuditLogResponse(AuditLogBase):
    id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True
