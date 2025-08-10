import React, { useCallback } from 'react';
import { fetchMeters, fetchReadingsForMeter } from '../services/meterApi';
import { useMockFetch } from '../hooks/useMockFetch';
import Card from '../components/common/Card';
import { type Meter, type MeterReading} from '../types';
// Make sure you have a DashboardPage.css file for styles
import './DashboardPage.css';

// A "dumb" component to display readings for a single meter
const MeterReadings: React.FC<{ meterId: string }> = ({ meterId }) => {
  const getReadings = useCallback(() => fetchReadingsForMeter(meterId), [meterId]);
  const { data: readings, isLoading, error } = useMockFetch<MeterReading[]>(getReadings);

  if (isLoading) return <p>Loading readings...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <ul>
      {readings?.map(reading => (
        <li key={reading.id}>
          {new Date(reading.timestamp).toLocaleTimeString()}:{' '}
          <strong>{reading.value} {reading.unit}</strong>
        </li>
      ))}
    </ul>
  );
};

// The main page component
const DashboardPage: React.FC = () => {
  const getMeters = useCallback(() => fetchMeters(), []);
  const { data: meters, isLoading, error } = useMockFetch<Meter[]>(getMeters);

  return (
    <div>
      <h1>Dashboard</h1>
      {isLoading && <p>Loading meters...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="dashboard-grid">
        {meters?.map(meter => (
          <Card key={meter.id} title={`${meter.location} (${meter.status})`}>
            <MeterReadings meterId={meter.id} />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;