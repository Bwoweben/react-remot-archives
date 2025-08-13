from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class Record(Base):
    __tablename__ = "records"

    id = Column(Integer, primary_key=True, index=True)
    time_stamp = Column(DateTime, nullable=False, index=True)
    
    # --- ADD THESE MISSING COLUMNS ---
    panel_voltage = Column(Float, nullable=True)
    panel_current = Column(Float, nullable=True)
    battery_voltage = Column(Float, nullable=True)
    
    # Foreign key to the 'devices' table
    device_id = Column('device', Integer, ForeignKey("devices.id"))
    
    # Relationships
    device = relationship("Device", back_populates="records")
    meta = relationship("RecordMeta", back_populates="record", uselist=False)

class RecordMeta(Base):
    __tablename__ = "records_meta"

    id = Column(Integer, primary_key=True, index=True)
    extras = Column(Text)
    
    # Foreign key to the 'records' table
    record_id = Column(Integer, ForeignKey("records.id"))
    
    record = relationship("Record", back_populates="meta")
