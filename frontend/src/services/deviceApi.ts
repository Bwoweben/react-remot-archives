import { type DoorOpeningStats, type MultiDeviceStatusResponse } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

/**
 * Fetches door opening statistics for a single device on a specific date.
 * @param serialNumber The serial number of the device to query.
 * @param date The date for which to fetch stats, in 'YYYY-MM-DD' format.
 * @returns A promise that resolves to the door opening statistics.
 */
export const fetchDoorOpeningStats = async (serialNumber: string, date: string): Promise<DoorOpeningStats> => {
  const response = await fetch(`${API_BASE_URL}/devices/${serialNumber}/door-openings?date=${date}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Device with serial number '${serialNumber}' not found.`);
    }
    throw new Error('An error occurred while fetching the door opening data.');
  }
  return response.json();
};

/**
 * Fetches the current status for multiple devices based on a list of identifiers.
 * @param identifiers An array of device identifiers (serial numbers, SIM numbers, etc.).
 * @returns A promise that resolves to the status of the queried devices.
 */
export const fetchMultiDeviceStatus = async (identifiers: string[]): Promise<MultiDeviceStatusResponse> => {
  const response = await fetch(`${API_BASE_URL}/devices/status-lookup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identifiers }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch device statuses');
  }
  return response.json();
};