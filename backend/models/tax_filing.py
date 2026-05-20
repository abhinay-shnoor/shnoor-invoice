from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class TaxFiling(Base):
    __tablename__ = "tax_filings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filing_month = Column(String, nullable=False) # e.g. "2023-10"
    gst_amount = Column(Float, nullable=False)
    status = Column(String, default="pending") # pending, submitted
    submitted_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User")
