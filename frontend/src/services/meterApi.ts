import { type Meter, type MeterReading} from '../types';

const mockMeters: Meter[] = [
  { id: 'meter-001', location: 'Factory A', status: 'active' },
  { id: 'meter-002', location: 'Warehouse B', status: 'active' },
  { id: 'meter-003', location: 'Office C', status: 'inactive' },
];

const generateMockReadings = (meterId: string): MeterReading[] => {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `reading-${meterId}-${i}`,
    meterId,
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    value: parseFloat((100 + Math.random() * 50).toFixed(2)),
    unit: 'kWh',
  }));
};

// Simulates fetching all meters from a server
export const fetchMeters = (): Promise<Meter[]> => {
  console.log('API: Fetching all meters...');
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('API: Responded with meters.');
      resolve(mockMeters);
    }, 800); // 0.8 second delay
  });
};

// Simulates fetching readings for a specific meter
export const fetchReadingsForMeter = (meterId: string): Promise<MeterReading[]> => {
  console.log(`API: Fetching readings for ${meterId}...`);
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`API: Responded with readings for ${meterId}.`);
      resolve(generateMockReadings(meterId));
    }, 1200); // 1.2 second delay
  });
};
