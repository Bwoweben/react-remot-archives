import math
from celery import Celery
from sqlalchemy import extract

# --- Core App Imports ---
from app.core.config import settings
from app.db.session import SessionLocal
from app.db.mongo_session import MongoManager

# --- Model Imports ---
from app.models.user import User
from app.models.device import Device
from app.models.meter import Record

# 1. Configure the Celery app instance
celery_app = Celery(
    "tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

@celery_app.task(name="calculate_single_day_co2")
def calculate_single_day_co2_task(client_id: int, serial: str, alias: str, client_name: str, year: int, month: int, day: int):
    """
    This is a granular background task that calculates CO2 emissions for a
    SINGLE device on a SINGLE day and saves the result to MongoDB.
    """
    # Each task runs in its own process, so we must create new
    # database connections within the task itself.
    db = SessionLocal()
    mongo = MongoManager()

    try:
        # --- Constants for calculation ---
        CONSUMPTION_150 = 0.1505817
        CONSUMPTION_684 = 0.684462
        FACTOR_150 = 0.0068
        FACTOR_684 = 0.0013
        FACTOR_684_PLUS = 0.001

        # Check if this specific day has already been calculated to avoid duplicate work
        unique_id = f"CCO2A{client_id}A{serial}A{year}A{month}A{day}"
        if mongo.logged_bank.count_documents({'unique_id': unique_id}) > 0:
            return {"status": "SKIPPED", "day": day, "serial": serial}

        # --- Fetch raw data for this specific day ---
        device_stamps = db.query(Record.time_stamp, Record.supply_voltage, Record.panel_current).select_from(Device)\
            .join(Record, Record.device_id == Device.id)\
            .filter(
                Device.serial == serial,
                extract('year', Record.time_stamp) == year,
                extract('month', Record.time_stamp) == month,
                extract('day', Record.time_stamp) == day
            ).order_by(Record.time_stamp.asc()).all()

        if not device_stamps:
            return {"status": "NO_DATA", "day": day, "serial": serial}

        # --- Perform the energy and CO2 calculation ---
        energy = 0.0
        previous_timestamp = None
        for timestamp, voltage, current in device_stamps:
            if previous_timestamp:
                time_diff_hours = (timestamp - previous_timestamp).total_seconds() / 3600
                if time_diff_hours <= 0.5:
                    v = float(voltage) if voltage is not None else 0.0
                    c = float(current) if current is not None else 0.0
                    energy_value = v * c * time_diff_hours
                    if not (math.isnan(energy_value) or math.isinf(energy_value)):
                        energy += energy_value
            previous_timestamp = timestamp
        
        energy_kwh = energy / 1000
        
        if energy_kwh <= CONSUMPTION_150:
            carbonEmissions = energy_kwh * FACTOR_150
        elif energy_kwh <= CONSUMPTION_684:
            carbonEmissions = (energy_kwh - CONSUMPTION_150) * FACTOR_684 + (CONSUMPTION_150 * FACTOR_150)
        else:
            carbonEmissions = (energy_kwh - CONSUMPTION_684) * FACTOR_684_PLUS + (CONSUMPTION_150 * FACTOR_150) + ((CONSUMPTION_684 - CONSUMPTION_150) * FACTOR_684)

        # --- Save the single result to MongoDB ---
        day_data = {
            'unique_id': unique_id,
            'client_id': client_id,
            'client_name': client_name,
            'serial': serial,
            'site_name': alias,
            'year': year,
            'month': month,
            'day': day,
            'energy_per_day': energy_kwh,
            'CO2_emissions': carbonEmissions
        }
        mongo.givo_co2.insert_one(day_data)
        mongo.logged_bank.insert_one({'unique_id': unique_id})

        return {"status": "SUCCESS", "day": day, "serial": serial}
    
    finally:
        # Ensure the database session is always closed to prevent connection leaks
        db.close()
