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

// --- Types for the All Clients Stats Endpoint ---

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

// Describes the entire JSON object returned by the /all-clients-stats endpoint
export interface AllClientsResponse {
  clients: ClientDeviceStats[]; // A list of individual client stats
  total_online: number;
  total_offline: number;
  total_devices: number;
}

// --- NEW: Types for the CO2 Emissions Endpoint ---

// Describes the calculated data for a single client for a single year
export interface CO2ClientData {
  client_id: string;
  year: number;
  total_energy: number;
  total_CO2: number;
}

// Describes the entire JSON object returned by the /clients-annual-co2 endpoint
export interface CO2StatsResponse {
  data: CO2ClientData[];
}

// Describes a single door opening event
export interface DoorOpeningEvent {
  id: number;
  timestamp: string;
  duration_seconds: number;
}

// Describes the entire JSON object returned by the API
export interface DoorOpeningStats {
  serial_number: string;
  date: string;
  total_openings: number;
  average_duration_seconds: number;
  openings: DoorOpeningEvent[];
}

export interface DeviceStatus {
  No: number;
  serial: string;
  alias?: string;
  sim_no?: string;
  log_status?: string;
  last_log?: string;
  first_name?: string;
  last_name?: string;
  log_duration?: number;
}

export interface MultiDeviceStatusResponse {
  registered_devices: DeviceStatus[];
  test_devices: DeviceStatus[];
}