from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship

# Import the shared Base from base.py
from .base import Base

class Record(Base):
    """
    SQLAlchemy model for the 'records' or 'meter_readings' table.
    """
    __tablename__ = "records" # Or whatever your readings table is called

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    value = Column(Float, nullable=False)
    
    # This column holds the ID of the device that created this record.
    # It creates a foreign key constraint to the 'devices' table.
    device_id = Column(Integer, ForeignKey("devices.id"))

    # This creates the relationship back to the Device model.
    # It tells SQLAlchemy that the 'device' attribute on a Record instance
    # should be populated with the related Device object.
    device = relationship("Device", back_populates="records")