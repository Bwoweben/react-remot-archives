/*
================================================================================
File: src/types/index.ts
Description: The complete, consolidated list of all TypeScript interfaces
             used across the frontend application.
================================================================================
*/

// --- Shared Navigation Type ---
export type Page = 'dashboard' | 'settings' | 'allClients' | 'co2' | 'deviceAnalytics';

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

// --- Types for the All Clients Stats Page ---
export interface ClientDeviceStats {
  id: number;
  country: string | null;
  first_name: string;
  last_name: string;
  no_of_devices: number;
  online: number;
  offline: number;
}

export interface AllClientsResponse {
  clients: ClientDeviceStats[];
  total_online: number;
  total_offline: number;
  total_devices: number;
}

// --- Types for the CO2 Emissions Page (Annual) ---
export interface CO2ClientData {
  client_id: number;
  year: number;
  total_energy: number;
  total_CO2: number;
}

export interface CO2StatsResponse {
  data: CO2ClientData[];
}

// --- Types for the CO2 Emissions Page (Monthly Deep Dive) ---
export interface MonthlyCO2Data {
  client_id: number;
  client_name: string;
  serial: string;
  site_name?: string;
  year: number;
  month: number;
  day: number;
  energy_per_day: number;
  CO2_emissions: number;
}

export interface MonthlyCO2Response {
  data: MonthlyCO2Data[];
}

// --- Types for Device Analytics (Door Openings) ---
export interface DoorOpeningEvent {
  id: number;
  timestamp: string;
  duration_seconds: number;
}

export interface DoorOpeningStats {
  serial_number: string;
  date: string;
  total_openings: number;
  average_duration_seconds: number;
  openings: DoorOpeningEvent[];
}

// --- Types for Device Analytics (Multi-Status Lookup) ---
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

// --- Types for Device Analytics (Log Count) ---
export interface LogCountResult {
  No: number;
  serial: string;
  alias?: string;
  last_log?: string;
  first_name?: string;
  last_name?: string;
  model_name?: string;
  log_count: number;
}

export interface LogCountResponse {
  data: LogCountResult[];
}

// --- Types for Device Analytics (Recent Logs) ---
export interface DeviceLog {
  time_stamp: string;
  panel_voltage?: number;
  panel_current?: number;
  battery_voltage?: number;
  supply_voltage?: number;
  extras?: string;
}

export interface DeviceLogResponse {
  serial_number: string;
  logs: DeviceLog[];
}

export interface StartTaskResponse {
  task_id: string;
}

export interface TaskStatusResponse {
  task_id: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILURE';
  result: any;
}
