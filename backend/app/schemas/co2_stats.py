from pydantic import BaseModel
from typing import List, Optional

class CO2ClientData(BaseModel):
    """
    Schema for the annual CO2 summary.
    """
    client_id: int
    year: int
    total_energy: float
    total_CO2: float

class CO2StatsResponse(BaseModel):
    data: List[CO2ClientData]

# --- ADD THESE MISSING SCHEMAS ---

class MonthlyCO2Data(BaseModel):
    """
    Schema for a single day's calculated CO2 data.
    """
    client_id: int
    client_name: str
    serial: str
    site_name: Optional[str] = None
    year: int
    month: int
    day: int
    energy_per_day: float
    CO2_emissions: float

class MonthlyCO2Response(BaseModel):
    """
    Schema for the entire response of the monthly deep dive endpoint.
    """
    data: List[MonthlyCO2Data]