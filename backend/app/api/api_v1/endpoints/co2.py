# app/api/api_v1/endpoints/co2.py
from fastapi import APIRouter, Depends
from app.db.mongo_session import get_mongo_db, MongoManager
from app.schemas.co2_stats import CO2StatsResponse

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

    # 1. MongoDB Aggregation Pipeline
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
    
    # Use the mongo_manager to run the aggregation
    aggregated_data = list(mongo.energy.aggregate(pipeline))
    print(aggregated_data)

    # 2. Process data and calculate CO2
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
            "total_CO2": round(carbon_emissions, 4) # Round for cleaner output
        })

    return {"data": processed_data}