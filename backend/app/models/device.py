from sqlalchemy import Column, DateTime, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    serial = Column(String(255), unique=True, index=True)
    log_status = Column(String(50))
    alias = Column(String(255), nullable=True)
    sim_no = Column(String(50), nullable=True)
    last_log = Column(DateTime(50), nullable=True)
    
    # This column is named 'user' in your database
    user = Column('user', Integer, ForeignKey("users.id"))
    
    # The relationship is named 'owner' to avoid conflict with the 'user' column
    owner = relationship("User", back_populates="devices")
    records = relationship("Record", back_populates="device")