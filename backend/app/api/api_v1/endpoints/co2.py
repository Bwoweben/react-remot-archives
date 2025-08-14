import math
import calendar
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import extract
from celery import group
from celery.result import GroupResult

# --- Core App Imports ---
from app.api import deps
from app.db.mongo_session import get_mongo_db, MongoManager
from app.celery_worker import calculate_single_day_co2_task, celery_app

# --- Schema and Model Imports ---
from app.schemas.co2_stats import CO2StatsResponse, MonthlyCO2Response
from app.models.user import User
from app.models.device import Device
from app.models.meter import Record

router = APIRouter()

@router.get("/clients-annual-co2", response_model=CO2StatsResponse)
def get_clients_annual_co2(mongo: MongoManager = Depends(get_mongo_db)):
    """
    Aggregates annual energy consumption and calculates CO2 emissions per client.
    This is a high-level summary and does not use background tasks.
    """
    # ... (The logic for this function remains unchanged)
    CONSUMPTION_55 = 55
    CONSUMPTION_250 = 250
    FACTOR_55 = 0.0068
    FACTOR_250 = 0.0013
    FACTOR_250_PLUS = 0.0010

    pipeline = [
        {'$group': {'_id': {'client_id': '$client_id', 'year': '$year'}, 'total_energy': {'$sum': '$energy_per_month'}}},
        {'$sort': {'_id.client_id': 1, '_id.year': 1}}
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
            "client_id": doc['_id']['client_id'], "year": doc['_id']['year'],
            "total_energy": cumulative_energy, "total_CO2": round(carbon_emissions, 4)
        })
    return {"data": processed_data}


@router.post("/start-monthly-co2-calculation")
def start_monthly_co2_calculation(client_id: int, year: int, month: int, db: Session = Depends(deps.get_db)):
    """
    Dispatches hundreds of small background tasks, one for each device/day,
    and returns a group ID to track their collective progress.
    """
    client_devices = db.query(Device.serial, Device.alias).filter(Device.user == client_id).all()
    if not client_devices:
        raise HTTPException(status_code=404, detail="Client or devices not found.")
        
    client_name_query = db.query(User.first_name, User.last_name).filter(User.id == client_id).first()
    client_name = f"{client_name_query.first_name} {client_name_query.last_name}"

    # Determine the number of days in the given month and year
    _, num_days = calendar.monthrange(year, month)

    # Create a group of all the individual tasks we need to run
    tasks = group(
        calculate_single_day_co2_task.s(client_id, dev.serial, dev.alias, client_name, year, month, day)
        for dev in client_devices
        for day in range(1, num_days + 1)
    )
    
    # Execute the group of tasks in the background
    task_group = tasks.apply_async()
    task_group.save() # Save the group's metadata to the result backend (Redis)
    
    return {"group_id": task_group.id, "total_tasks": len(tasks)}


@router.get("/task-group-progress/{group_id}")
def get_task_group_progress(group_id: str):
    """
    Checks the progress of a group of Celery tasks.
    """
    task_group = GroupResult.restore(group_id, app=celery_app)
    if not task_group:
        raise HTTPException(status_code=404, detail="Task group not found.")
        
    return {
        "group_id": group_id,
        "total": len(task_group.results),
        "completed": task_group.completed_count(),
        "status": "COMPLETE" if task_group.ready() else "IN_PROGRESS"
    }


@router.get("/client-monthly-co2", response_model=MonthlyCO2Response)
def get_monthly_co2_results(client_id: int, year: int, month: int, mongo: MongoManager = Depends(get_mongo_db)):
    """
    Retrieves the results of a monthly calculation from MongoDB.
    This is used for polling the final data as it's being populated.
    """
    results = list(mongo.givo_co2.find(
        {"client_id": client_id, "year": year, "month": month},
        {'_id': 0}
    ))
    return {"data": results}
