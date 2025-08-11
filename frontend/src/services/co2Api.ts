// src/services/co2Api.ts
import { type CO2StatsResponse } from '../types'; // Define this type in index.ts

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const fetchCO2Stats = async (): Promise<CO2StatsResponse> => {
  const response = await fetch(`${API_BASE_URL}/co2/clients-annual-co2`);
  if (!response.ok) {
    throw new Error('Failed to fetch CO2 statistics');
  }
  return response.json();
};