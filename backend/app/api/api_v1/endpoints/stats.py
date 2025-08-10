# app/api/api_v1/endpoints/stats.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case

from app.api import deps
from app.models.device import Device # Assuming your model is named Device
from app.models.user import User # Assuming your model is named User
from app.schemas.client_stats import AllClientsResponse, ClientDeviceStats

router = APIRouter()

@router.get("/all-clients-stats", response_model=AllClientsResponse)
def get_all_clients_stats(db: Session = Depends(deps.get_db)):
    
    print("--- Request received for all-clients-stats ---") # <-- ADD THIS
    
    try:
        employees_database_ids = [166, 108, 160, 10, 13, 61, 57, 58, 2, 37, 410, 427, 432, 433,
                                441, 364, 379, 396, 399, 132, 375, 552, 553, 592]

        print("--- Starting client stats query... ---") # <-- ADD THIS
        # 1. Get the detailed list of clients and their device stats
        client_stats_query = db.query(
            User.id,
            User.country,
            User.first_name,
            User.last_name,
            func.count(Device.user).label("no_of_devices"),
            func.sum(case((Device.log_status != '0', 1), else_=0)).label("online"),
            func.sum(case((Device.log_status == '0', 1), else_=0)).label("offline")
        ).join(Device, Device.user == User.id)\
        .filter(~User.id.in_(employees_database_ids))\
        .group_by(User.id, User.country, User.first_name, User.last_name)\
        .all()
        
        print("--- Finished client stats query. ---") # <-- ADD THIS
        
        print("--- Starting total online query... ---") # <-- ADD THIS
        # 2. Get total online devices
        total_online = db.query(Device.id)\
                        .filter(Device.log_status != '0', ~Device.user.in_(employees_database_ids))\
                        .count()
                        
        print(f"--- Finished total online query. Count: {total_online} ---") # <-- ADD THIS
        # 3. Get total offline devices
        total_offline = db.query(Device.id)\
                        .filter(Device.log_status == '0', ~Device.user.in_(employees_database_ids))\
                        .count()
        print("--- Preparing to send response. ---") # <-- ADD THIS
        return {
            "clients": client_stats_query,
            "total_online": total_online,
            "total_offline": total_offline,
            "total_devices": total_online + total_offline
        }
    except Exception as e:
            print(f"!!! AN ERROR OCCURRED: {e} !!!") # <-- ADD THIS
            raise e