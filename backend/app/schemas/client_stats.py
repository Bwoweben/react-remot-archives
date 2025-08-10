# app/schemas/client_stats.py
from pydantic import BaseModel
from typing import List

class ClientDeviceStats(BaseModel):
    id: int
    country: str | None
    first_name: str
    last_name: str
    no_of_devices: int
    online: int
    offline: int

class AllClientsResponse(BaseModel):
    clients: List[ClientDeviceStats]
    total_online: int
    total_offline: int
    total_devices: int