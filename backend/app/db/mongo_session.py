# app/db/mongo_session.py
from pymongo import MongoClient
from app.core.config import settings
import redis

class MongoManager:
    """
    MongoManager handles the connection to MongoDB and provides
    easy-to-use shortcuts to frequently accessed collections
    across multiple databases.
    """
    def __init__(self):
        # --- Establish MongoDB connection using URI from settings ---
        self.client = MongoClient(settings.MONGO_CONNECTION_STRING)
        # We parse the Redis URL from settings to connect.
        self.redis_client = redis.from_url(settings.CELERY_BROKER_URL)
        
        # --- Select databases ---
        self.db_flask = self.client.flask_db       # Primary database
        self.db_kpis = self.client.kpis_bank       # KPI / analytics database

        # ==========================
        # Collections in flask_db
        # ==========================
        self.archives = self.db_flask.archives
        self.agroco = self.db_flask.agroco
        self.client_summary = self.db_flask.client_summary
        self.kpi_clients = self.db_flask.kpi_clients
        self.todos = self.db_flask.todos
        self.we4f_aptech = self.db_flask.we4f
        self.we4f_clasp = self.db_flask.we4f_clasp
        self.online_as_at = self.db_flask.online_as_at
        self.online_as_portfolio = self.db_flask.online_as_portfolio
        self.online_check = self.db_flask.online_check
        self.logged_bank = self.db_flask.logged_bank

        # ==========================
        # Collections in kpis_bank
        # ==========================
        self.energy = self.db_kpis.we4f_data
        self.sample = self.db_kpis.sample
        self.givo_energy = self.db_kpis.givo_energy
        self.givo_energy_2 = self.db_kpis.givo_energy_2
        self.givo_power = self.db_kpis.givo_power
        self.givo_co2 = self.db_kpis.givo_co2
        self.energy_water_dump = self.db_kpis.energy_water_dump
        self.pilots = self.db_kpis.pilot_data

# --- Create a single shared instance of MongoManager ---
mongo_manager = MongoManager()

def get_mongo_db():
    """
    FastAPI dependency to inject the shared MongoManager instance
    into API endpoints.
    Example:
        @app.get("/data")
        def get_data(mongo: MongoManager = Depends(get_mongo_db)):
            return list(mongo.archives.find({}))
    """
    return mongo_manager
