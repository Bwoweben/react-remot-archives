import { type CO2StatsResponse, 
    type MonthlyCO2Response,
    type StartTaskResponse, 
    type TaskStatusResponse} from '../types'; // Make sure to import the new type

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

/**
 * Fetches the high-level annual CO2 summary for all clients.
 */
export const fetchCO2Stats = async (): Promise<CO2StatsResponse> => {
  const response = await fetch(`${API_BASE_URL}/co2/clients-annual-co2`);
  if (!response.ok) {
    throw new Error('Failed to fetch CO2 statistics');
  }
  return response.json();
};

/**
 * Fetches or calculates the detailed daily CO2 data for a single client for a specific month.
 */
export const fetchMonthlyCO2Stats = async (clientId: number, year: number, month: number): Promise<MonthlyCO2Response> => {
  const response = await fetch(`${API_BASE_URL}/co2/client-monthly-co2?client_id=${clientId}&year=${year}&month=${month}`);
  if (!response.ok) {
    throw new Error('Failed to fetch monthly CO2 data');
  }
  return response.json();
};

export const startMonthlyCO2Task = async (clientId: number, year: number, month: number): Promise<StartTaskResponse> => {
    const response = await fetch(`${API_BASE_URL}/co2/start-monthly-co2-calculation?client_id=${clientId}&year=${year}&month=${month}`, {
      method: 'POST'
    });
    // ... error handling
    return response.json();
  };
  
  export const getTaskStatus = async (taskId: string): Promise<TaskStatusResponse> => {
    const response = await fetch(`${API_BASE_URL}/co2/task-status/${taskId}`);
    // ... error handling
    return response.json();
  };