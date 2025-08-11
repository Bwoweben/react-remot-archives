# app/schemas/co2_stats.py
from pydantic import BaseModel
from typing import List

class CO2ClientData(BaseModel):
    client_id: int
    year: int
    total_energy: float
    total_CO2: float

class CO2StatsResponse(BaseModel):
    data: List[CO2ClientData]