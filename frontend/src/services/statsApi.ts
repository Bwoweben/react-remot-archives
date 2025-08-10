// frontend/src/services/statsApi.ts
import { type AllClientsResponse } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const fetchAllClientsStats = async (): Promise<AllClientsResponse> => {
  // Add the "/stats" prefix to the URL here
  const response = await fetch(`${API_BASE_URL}/stats/all-clients-stats`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch client statistics');
  }
  return response.json();
};