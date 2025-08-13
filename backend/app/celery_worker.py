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
# This tells Celery where to find the Redis server (the "broker" and "backend")
celery_app = Celery(
    "tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

@celery_app.task(name="calculate_monthly_co2")
def calculate_monthly_co2_task(client_id: int, year: int, month: int):
    """
    This is the background task that performs the heavy calculation.
    It runs in a separate process and does not block the API.
    """
    # Each task runs in its own process, so we must create new
    # database connections here.
    db = SessionLocal()
    mongo = MongoManager()

    try:
        # --- This is the calculation logic from your original Flask function ---
        CONSUMPTION_150 = 0.1505817
        CONSUMPTION_684 = 0.684462
        FACTOR_150 = 0.0068
        FACTOR_684 = 0.0013
        FACTOR_684_PLUS = 0.001

        client_devices_query = db.query(Device.serial, Device.alias).filter(Device.user == client_id).all()
        if not client_devices_query:
            return {"status": "Failed", "message": "Client or devices not found."}
            
        client_name_query = db.query(User.first_name, User.last_name).filter(User.id == client_id).first()
        client_name = f"{client_name_query.first_name} {client_name_query.last_name}"

        calculated_daily_data = []

        for device in client_devices_query:
            for day_number in range(1, 32):
                unique_id = f"CCO2A{client_id}A{device.serial}A{year}A{month}A{day_number}"
                if mongo.logged_bank.count_documents({'unique_id': unique_id}) > 0:
                    continue # Skip if already calculated

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

                day_data = {
                    'unique_id': unique_id,
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
                
        # Insert all calculated data into MongoDB at once for efficiency
        if calculated_daily_data:
            mongo.givo_co2.insert_many(calculated_daily_data)
            for item in calculated_daily_data:
                mongo.logged_bank.insert_one({'unique_id': item['unique_id']})

        return {"status": "Complete", "client_id": client_id, "year": year, "month": month, "days_processed": len(calculated_daily_data)}
    
    finally:
        # Ensure the database session is always closed
        db.close()
