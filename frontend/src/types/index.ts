// --- Original Meter and Reading Types ---
export interface MeterReading {
    id: string;
    meterId: string;
    timestamp: string;
    value: number;
    unit: 'kWh';
  }
  
  export interface Meter {
    id: string;
    location: string;
    status: 'active' | 'inactive' | 'error';
  }
  
  // --- NEW: Types for the All Clients Stats Endpoint ---
  
  // Describes the statistics for a single client
  export interface ClientDeviceStats {
    id: number;
    country: string | null; // Can be null if not present in the DB
    first_name: string;
    last_name: string;
    no_of_devices: number;
    online: number;
    offline: number;
  }
  
  // Describes the entire JSON object returned by the API
  export interface AllClientsResponse {
    clients: ClientDeviceStats[]; // A list of individual client stats
    total_online: number;
    total_offline: number;
    total_devices: number;
  }