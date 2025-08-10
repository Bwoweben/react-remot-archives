# app/api/api_v1/endpoints/meters.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.api import deps
from app.models.device import Device
from app.schemas.meter import Meter, MeterReading # Assuming you have these schemas

router = APIRouter()

@router.get("/{meter_id}", response_model=Meter)
def get_meter_details(meter_id: int, db: Session = Depends(deps.get_db)):
    """
    Get details for a specific meter.
    """
    db_meter = db.query(Device).filter(Device.id == meter_id).first()
    if db_meter is None:
        raise HTTPException(status_code=404, detail="Meter not found")
    return db_meter

@router.get("/{meter_id}/readings", response_model=List[MeterReading])
def get_meter_readings(meter_id: int, db: Session = Depends(deps.get_db)):
    """
    Get the latest readings for a specific meter.
    """
    # This is a placeholder for your actual query logic
    # You would query the 'records' table here.
    return [{"id": 1, "timestamp": "2025-08-10T17:30:00Z", "value": 123.45, "meterId": meter_id, "unit": "kWh"}]