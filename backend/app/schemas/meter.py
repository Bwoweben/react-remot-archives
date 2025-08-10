# app/schemas/meter.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List # <-- ADD THIS IMPORT

# --- Meter Reading Schemas ---
class MeterReadingBase(BaseModel):
    timestamp: datetime
    value: float
    unit: str

class MeterReadingCreate(MeterReadingBase):
    pass

class MeterReading(MeterReadingBase):
    id: int
    meterId: int

    class Config:
        from_attributes = True

# --- Meter (Device) Schemas ---
class MeterBase(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None

class MeterCreate(MeterBase):
    pass

class Meter(MeterBase):
    id: int
    readings: List[MeterReading] = []

    class Config:
        from_attributes = True