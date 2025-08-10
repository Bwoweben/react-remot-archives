from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

# Import the shared Base from base.py
from .base import Base

class Device(Base):
    """
    SQLAlchemy model for the 'devices' table.
    """
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=True)
    log_status = Column(String(50), nullable=True)
    
    # This column holds the ID of the user who owns this device.
    # It creates a foreign key constraint in the database.
    user = Column('user', Integer, ForeignKey("users.id")) 

    # This creates the relationship back to the User model.
    # It tells SQLAlchemy that the 'user' attribute on a Device instance
    # should be populated with the related User object.
    # 'back_populates' links this relationship to the 'devices' attribute on the User model.
    owner = relationship("User", back_populates="devices") 
