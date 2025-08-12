from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class DeviceModel(Base):
    """
    SQLAlchemy model for the 'device_models' table.
    """
    __tablename__ = "device_models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    
    # This relationship links a model to the many devices it can have.
    devices = relationship("Device", back_populates="model")

class Device(Base):
    """
    SQLAlchemy model for the 'devices' table.
    """
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    serial = Column(String(255), unique=True, index=True)
    log_status = Column(String(50))
    alias = Column(String(255), nullable=True)
    sim_no = Column(String(50), nullable=True)
    date_assigned = Column(DateTime, nullable=True)
    status = Column(String(50), nullable=True)
    device_type = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)
    last_log = Column(DateTime, nullable=True)

    # --- Foreign Keys ---
    # This column is named 'user' in your database and links to the 'users' table.
    user = Column('user', Integer, ForeignKey("users.id"))
    # This column links to the 'device_models' table.
    version = Column(Integer, ForeignKey("device_models.id"))

    # --- Relationships ---
    # The relationship to the User model, renamed to 'owner' to avoid conflict.
    owner = relationship("User", back_populates="devices")
    # The relationship to the Record model.
    records = relationship("Record", back_populates="device")
    # The relationship to the DeviceModel model.
    model = relationship("DeviceModel", back_populates="devices")
