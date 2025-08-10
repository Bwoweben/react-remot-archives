from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

# Import the shared Base from base.py
from .base import Base

class User(Base):
    """
    SQLAlchemy model for the 'users' table.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    country = Column(String(100), nullable=True)

    # This creates the relationship to the Device model.
    # It tells SQLAlchemy that the 'devices' attribute on a User instance
    # should be populated with a list of related Device objects.
    # 'back_populates' links this relationship to the 'user' attribute on the Device model.
    devices = relationship("Device", back_populates="owner") # Matches the new relationship name
