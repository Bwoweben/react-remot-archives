from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import case, func
from datetime import datetime, time, timedelta
from typing import List

from app.api import deps
from app.models.device import Device, DeviceModel
from app.models.meter import Record, RecordMeta
from app.models.user import User
from app.schemas.device_analytics import (
    DoorOpeningStats, 
    MultiDeviceStatusResponse, 
    DeviceStatusRequest,
    LogCountResponse,
    DeviceLogResponse
)

router = APIRouter()

@router.get("/{serial_number}/door-openings", response_model=DoorOpeningStats)
def get_door_opening_stats(serial_number: str, date: str, db: Session = Depends(deps.get_db)):
    """
    Analyzes and returns door opening statistics for a specific device on a given date.
    """
    try:
        start_datetime = datetime.combine(datetime.fromisoformat(date), time.min)
        end_datetime = datetime.combine(datetime.fromisoformat(date), time.max)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Please use YYYY-MM-DD.")

    device_stamps = db.query(
        Record.time_stamp,
        RecordMeta.extras
    ).select_from(Record)\
     .join(Device, Device.id == Record.device_id)\
     .join(RecordMeta, RecordMeta.record_id == Record.id)\
     .filter(Device.serial == serial_number)\
     .filter(Record.time_stamp.between(start_datetime, end_datetime))\
     .order_by(Record.time_stamp.asc())\
     .all()

    if not device_stamps:
        raise HTTPException(status_code=404, detail=f"No records found for device '{serial_number}' on {date}.")

    daily_values = []
    for stamp in device_stamps:
        try:
            door_value_str = stamp.extras.split(',')[2].split(':')[1]
            daily_values.append(float(door_value_str))
        except (IndexError, ValueError, AttributeError):
            continue
    
    openings = []
    current_opening_duration = 0
    opening_count = 0
    
    for value in daily_values:
        if value > 0:
            current_opening_duration += value
        else:
            if current_opening_duration > 0:
                opening_count += 1
                openings.append({
                    "id": opening_count,
                    "timestamp": datetime.now(), # Placeholder
                    "duration_seconds": current_opening_duration
                })
            current_opening_duration = 0
    
    if current_opening_duration > 0:
        opening_count += 1
        openings.append({
            "id": opening_count,
            "timestamp": datetime.now(),
            "duration_seconds": current_opening_duration
        })

    total_duration = sum(op['duration_seconds'] for op in openings)
    average_duration = (total_duration / opening_count) if opening_count > 0 else 0

    return {
        "serial_number": serial_number,
        "date": date,
        "total_openings": opening_count,
        "average_duration_seconds": average_duration,
        "openings": openings
    }


@router.post("/status-lookup", response_model=MultiDeviceStatusResponse)
def get_multi_device_status(request_data: DeviceStatusRequest, db: Session = Depends(deps.get_db)):
    """
    Looks up the status for multiple devices based on a list of identifiers.
    """
    unique_params = list(dict.fromkeys(request_data.identifiers))

    order_clause = case(
        *[(Device.serial == item_id, index) for index, item_id in enumerate(unique_params)],
        else_=len(unique_params)
    )

    devices_query = db.query(
        Device.serial, Device.alias, Device.sim_no, Device.log_status,
        Device.last_log, User.first_name, User.last_name
    ).join(User, Device.user == User.id)\
     .filter(Device.serial.in_(unique_params) | Device.sim_no.in_(unique_params))\
     .order_by(order_clause)\
     .all()

    test_devices_query = db.query(
        Device.serial, Device.alias, Device.sim_no, Device.log_status, Device.last_log
    ).filter(Device.serial.in_(unique_params), Device.alias == '').all()

    registered_devices = []
    for i, device in enumerate(devices_query):
        log_duration = abs((device.last_log - datetime.now()).days) if device.last_log else None
        device_dict = device._asdict()
        if device_dict.get('log_status') is not None:
            device_dict['log_status'] = str(device_dict['log_status'])
        registered_devices.append({**device_dict, "No": i + 1, "log_duration": log_duration})

    test_devices = []
    for i, device in enumerate(test_devices_query):
        log_duration = abs((device.last_log - datetime.now()).days) if device.last_log else None
        device_dict = device._asdict()
        if device_dict.get('log_status') is not None:
            device_dict['log_status'] = str(device_dict['log_status'])
        test_devices.append({**device_dict, "No": i + 1, "log_duration": log_duration})
        
    return {"registered_devices": registered_devices, "test_devices": test_devices}


@router.post("/log-count", response_model=LogCountResponse)
def get_log_count(request_data: DeviceStatusRequest, db: Session = Depends(deps.get_db)):
    """
    Counts logs for devices within a time window before their last_log date.
    """
    unique_params = list(dict.fromkeys(request_data.identifiers))

    devices = db.query(
        Device.serial, Device.alias, Device.last_log,
        User.first_name, User.last_name, DeviceModel.name.label("model_name"),
        func.count(Record.id).label("log_count")
    ).select_from(Device)\
     .join(Record, Record.device_id == Device.id)\
     .join(User, User.id == Device.user)\
     .join(DeviceModel, DeviceModel.id == Device.version)\
     .filter(Device.serial.in_(unique_params))\
     .filter(
         Record.time_stamp >= (Device.last_log - timedelta(hours=3)),
         Record.time_stamp <= Device.last_log
     )\
     .group_by(
         Device.serial, Device.alias, Device.last_log,
         User.first_name, User.last_name, DeviceModel.name
     ).all()

    modified_list = [
        {**row._asdict(), "No": idx + 1}
        for idx, row in enumerate(devices)
    ]

    return {"data": modified_list}


@router.get("/{serial_number}/recent-logs", response_model=DeviceLogResponse)
def get_recent_logs(serial_number: str, hours: int = 3, db: Session = Depends(deps.get_db)):
    """
    Fetches detailed logs for a device within N hours of its last communication.
    """
    last_log_time = db.query(Device.last_log).filter(Device.serial == serial_number).scalar()

    if not last_log_time:
        raise HTTPException(status_code=404, detail="Device has never logged.")

    start_time = last_log_time - timedelta(hours=hours)

    logs = db.query(
        Record.time_stamp,
        Record.panel_voltage,
        Record.panel_current,
        Record.battery_voltage
    ).join(Device, Record.device_id == Device.id)\
     .filter(
         Device.serial == serial_number,
         Record.time_stamp >= start_time,
         Record.time_stamp <= last_log_time
     )\
     .order_by(Record.time_stamp.desc())\
     .limit(1000)\
     .all()

    return {"serial_number": serial_number, "logs": logs}
