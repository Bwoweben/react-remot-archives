from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class KPIResponse(BaseModel):
    online_devices: int

@app.get("/kpi/devices-online", response_model=KPIResponse)
def get_devices_online():
    # Placeholder logic
    online_count = 42
    return KPIResponse(online_devices=online_count)
