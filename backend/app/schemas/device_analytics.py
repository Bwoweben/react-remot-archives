# app/schemas/device_analytics.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DoorOpeningEvent(BaseModel):
    id: int
    timestamp: datetime
    duration_seconds: float

class DoorOpeningStats(BaseModel):
    serial_number: str
    date: str
    total_openings: int
    average_duration_seconds: float
    openings: List[DoorOpeningEvent]

class DeviceStatusRequest(BaseModel):
    identifiers: List[str]

class DeviceStatus(BaseModel):
    No: int
    serial: str
    alias: Optional[str] = None
    sim_no: Optional[str] = None
    log_status: Optional[str] = None
    last_log: Optional[datetime] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    log_duration: Optional[int] = None

class MultiDeviceStatusResponse(BaseModel):
    registered_devices: List[DeviceStatus]
    test_devices: List[DeviceStatus]

class LogCountResult(BaseModel):
    No: int
    serial: str
    alias: Optional[str] = None
    last_log: Optional[datetime] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    model_name: Optional[str] = None
    log_count: int

class LogCountResponse(BaseModel):
    data: List[LogCountResult]

# --- ADD THESE MISSING SCHEMAS ---
class DeviceLog(BaseModel):
    time_stamp: datetime
    panel_voltage: Optional[float] = None
    panel_current: Optional[float] = None
    battery_voltage: Optional[float] = None

class DeviceLogResponse(BaseModel):
    serial_number: str
    logs: List[DeviceLog]