from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date
from sqlalchemy.orm import relationship
from database import Base

class Timesheet(Base):
    __tablename__ = "timesheets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="SET NULL"), nullable=True)
    project = Column(String)
    task = Column(String)
    hours = Column(Float, nullable=False)
    rate = Column(Float, default=0.0)
    status = Column(String, default="pending") # pending, invoiced
    date = Column(Date, nullable=False)

    user = relationship("User")
    client = relationship("Client")
