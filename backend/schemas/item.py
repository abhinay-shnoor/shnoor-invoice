from pydantic import BaseModel
from typing import Optional

class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    rate: float

class ItemCreate(ItemBase):
    pass

class ItemResponse(ItemBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
