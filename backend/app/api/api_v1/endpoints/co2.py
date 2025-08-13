import math
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import extract
from app.celery_worker import celery_app


from app.api import deps
from app.db.mongo_session import get_mongo_db, MongoManager
from app.schemas.co2_stats import CO2StatsResponse, MonthlyCO2Response
from app.models.user import User
from app.models.device import Device
from app.models.meter import Record

from app.celery_worker import calculate_monthly_co2_task
from celery.result import AsyncResult

router = APIRouter()

@router.get("/clients-annual-co2", response_model=CO2StatsResponse)
def get_clients_annual_co2(mongo: MongoManager = Depends(get_mongo_db)):
    """
    Aggregates annual energy consumption and calculates CO2 emissions per client.
    """
    # Tiered calculation constants
    CONSUMPTION_55 = 55
    CONSUMPTION_250 = 250
    FACTOR_55 = 0.0068
    FACTOR_250 = 0.0013
    FACTOR_250_PLUS = 0.0010

    pipeline = [
        {
            '$group': {
                '_id': {
                    'client_id': '$client_id',
                    'year': '$year'
                },
                'total_energy': {'$sum': '$energy_per_month'},
            }
        },
        {
            '$sort': {
                '_id.client_id': 1,
                '_id.year': 1
            }
        }
    ]
    
    aggregated_data = list(mongo.energy.aggregate(pipeline))

    processed_data = []
    for doc in aggregated_data:
        cumulative_energy = doc['total_energy']
        
        if cumulative_energy <= CONSUMPTION_55:
            carbon_emissions = cumulative_energy * FACTOR_55
        elif cumulative_energy <= CONSUMPTION_250:
            carbon_emissions = (cumulative_energy - CONSUMPTION_55) * FACTOR_250 + CONSUMPTION_55 * FACTOR_55
        else:
            carbon_emissions = (cumulative_energy - CONSUMPTION_250) * FACTOR_250_PLUS + CONSUMPTION_55 * FACTOR_55 + (CONSUMPTION_250 - CONSUMPTION_55) * FACTOR_250
        
        processed_data.append({
            "client_id": doc['_id']['client_id'],
            "year": doc['_id']['year'],
            "total_energy": cumulative_energy,
            "total_CO2": round(carbon_emissions, 4)
        })

    return {"data": processed_data}


@router.get("/client-monthly-co2", response_model=MonthlyCO2Response)
def get_or_calculate_monthly_co2(client_id: int, year: int, month: int, db: Session = Depends(deps.get_db), mongo: MongoManager = Depends(get_mongo_db)):
    """
    Retrieves or calculates the daily CO2 emissions for a specific client and month.
    """
    # First, check if the data already exists in MongoDB
    existing_data = list(mongo.givo_co2.find(
        {"client_id": client_id, "year": year, "month": month},
        {'_id': 0} # Exclude the MongoDB ObjectId
    ))
    
    if existing_data:
        return {"data": existing_data}

    # --- If not found, calculate it ---
    CONSUMPTION_150 = 0.1505817
    CONSUMPTION_684 = 0.684462
    FACTOR_150 = 0.0068
    FACTOR_684 = 0.0013
    FACTOR_684_PLUS = 0.001

    client_devices_query = db.query(Device.serial, Device.alias).filter(Device.user == client_id).all()
    if not client_devices_query:
        raise HTTPException(status_code=404, detail="Client or devices not found.")
        
    client_name_query = db.query(User.first_name, User.last_name).filter(User.id == client_id).first()
    client_name = f"{client_name_query.first_name} {client_name_query.last_name}"

    calculated_daily_data = []

    for device in client_devices_query:
        for day_number in range(1, 32): # Simple loop for days, will produce empty results for non-existent days
            device_stamps = db.query(Record.time_stamp, Record.supply_voltage, Record.panel_current).select_from(Device)\
                .join(Record, Record.device_id == Device.id)\
                .filter(
                    Device.serial == device.serial,
                    extract('year', Record.time_stamp) == year,
                    extract('month', Record.time_stamp) == month,
                    extract('day', Record.time_stamp) == day_number
                ).order_by(Record.time_stamp.asc()).all()

            if not device_stamps:
                continue

            energy = 0.0
            previous_timestamp = None
            for timestamp, voltage, current in device_stamps:
                if previous_timestamp:
                    time_diff_hours = (timestamp - previous_timestamp).total_seconds() / 3600
                    if time_diff_hours <= 0.5:
                        v = float(voltage) if voltage is not None else 0.0
                        c = float(current) if current is not None else 0.0
                        energy += v * c * time_diff_hours
                previous_timestamp = timestamp
            
            energy_kwh = energy / 1000
            
            if energy_kwh <= CONSUMPTION_150:
                carbonEmissions = energy_kwh * FACTOR_150
            elif energy_kwh <= CONSUMPTION_684:
                carbonEmissions = (energy_kwh - CONSUMPTION_150) * FACTOR_684 + (CONSUMPTION_150 * FACTOR_150)
            else:
                carbonEmissions = (energy_kwh - CONSUMPTION_684) * FACTOR_684_PLUS + (CONSUMPTION_150 * FACTOR_150) + ((CONSUMPTION_684 - CONSUMPTION_150) * FACTOR_684)

            day_data = {
                'client_id': client_id,
                'client_name': client_name,
                'serial': device.serial,
                'site_name': device.alias,
                'year': year,
                'month': month,
                'day': day_number,
                'energy_per_day': energy_kwh,
                'CO2_emissions': carbonEmissions
            }
            calculated_daily_data.append(day_data)

    if calculated_daily_data:
        mongo.givo_co2.insert_many(calculated_daily_data)
        
    return {"data": calculated_daily_data}

@router.post("/start-monthly-co2-calculation")
def start_monthly_co2_calculation(client_id: int, year: int, month: int):
    """
    Starts the CO2 calculation in the background and immediately returns a task ID.
    """
    task = calculate_monthly_co2_task.delay(client_id, year, month)
    return {"task_id": task.id}

@router.get("/task-status/{task_id}")
def get_task_status(task_id: str):
    """
    Checks the status of a background task.
    """
    task_result = AsyncResult(task_id, app=celery_app)
    result = {
        "task_id": task_id,
        "status": task_result.status,
        "result": task_result.result
    }
    return result
