import React, { useState, useMemo } from 'react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import StatCard from '../components/common/StatCard';
import Table from '../components/common/Table';
import { fetchDoorOpeningStats, fetchMultiDeviceStatus } from '../services/deviceApi';
import { type DoorOpeningStats, type MultiDeviceStatusResponse, type DeviceStatus } from '../types';
import './DeviceAnalyticsPage.css';

type AnalyticsMode = 'doorOpenings' | 'statusLookup';

// --- SVG Icons ---
const DoorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"/><path d="M10 12h4"/></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;

const DeviceAnalyticsPage: React.FC = () => {
  const [mode, setMode] = useState<AnalyticsMode>('doorOpenings');
  
  // --- State for both modes ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // --- State for Door Openings mode ---
  const [serialNumber, setSerialNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [doorData, setDoorData] = useState<DoorOpeningStats | null>(null);

  // --- State for Status Lookup mode ---
  const [identifiers, setIdentifiers] = useState('');
  const [statusData, setStatusData] = useState<MultiDeviceStatusResponse | null>(null);

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setDoorData(null);
    setStatusData(null);

    try {
      if (mode === 'doorOpenings') {
        if (!serialNumber) {
          setError('Please enter a serial number.');
          setIsLoading(false);
          return;
        }
        const result = await fetchDoorOpeningStats(serialNumber, date);
        setDoorData(result);
      } else { // statusLookup mode
        if (!identifiers.trim()) {
          setError('Please enter at least one identifier.');
          setIsLoading(false);
          return;
        }
        const idArray = identifiers.trim().split(/[\s,]+/); // Split by space, comma, or newline
        const result = await fetchMultiDeviceStatus(idArray);
        setStatusData(result);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Table Columns ---
  const doorOpeningColumns = useMemo(() => [
    { Header: '#', accessor: (row: any) => row.id },
    { Header: 'Timestamp', accessor: (row: any) => new Date(row.timestamp).toLocaleString() },
    { Header: 'Duration (seconds)', accessor: (row: any) => row.duration_seconds.toFixed(2) },
  ], []);

  const statusColumns = useMemo(() => [
    { Header: '#', accessor: (row: DeviceStatus) => row.No },
    { Header: 'Serial', accessor: (row: DeviceStatus) => row.serial },
    { Header: 'Owner', accessor: (row: DeviceStatus) => `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'N/A' },
    { Header: 'Last Log', accessor: (row: DeviceStatus) => row.last_log ? new Date(row.last_log).toLocaleString() : 'Never' },
    { Header: 'Offline (Days)', accessor: (row: DeviceStatus) => row.log_duration ?? 'N/A' },
  ], []);

  // --- Render Logic ---
  return (
    <div className="device-analytics-page">
      <h1 className="page-title">Device Analytics</h1>
      
      <div className="mode-toggle">
        <button onClick={() => setMode('doorOpenings')} className={mode === 'doorOpenings' ? 'active' : ''}>Single Device Analysis</button>
        <button onClick={() => setMode('statusLookup')} className={mode === 'statusLookup' ? 'active' : ''}>Multi-Device Status Lookup</button>
      </div>

      {mode === 'doorOpenings' ? (
        <div className="search-form-container">
          <Input id="serialNumber" label="Device Serial Number" placeholder="e.g., 301121005003" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
          <Input id="date" label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Button onClick={handleSearch} disabled={isLoading || !serialNumber}>Search</Button>
        </div>
      ) : (
        <div className="search-form-container multi-search">
          <div className="textarea-wrapper">
            <label htmlFor="identifiers">Device Identifiers</label>
            <textarea id="identifiers" placeholder="Enter serial numbers, SIM numbers, etc., separated by spaces, commas, or new lines..." value={identifiers} onChange={(e) => setIdentifiers(e.target.value)} />
          </div>
          <Button onClick={handleSearch} disabled={isLoading || !identifiers.trim()}>Search Statuses</Button>
        </div>
      )}

      <div className="results-container">
        {!hasSearched && <p className="info-text">Enter search parameters to view statistics.</p>}
        {isLoading && <p className="info-text">Loading data...</p>}
        {error && <p className="error-text">{error}</p>}
        
        {doorData && (
          <div className="results-content">
            <h2>Results for {doorData.serial_number} on {doorData.date}</h2>
            <div className="summary-cards">
              <StatCard title="Total Door Openings" value={doorData.total_openings} icon={<DoorIcon />} />
              <StatCard title="Avg. Duration (sec)" value={doorData.average_duration_seconds.toFixed(1)} icon={<ClockIcon />} />
            </div>
            <div className="clients-table-container">
              <h3>Individual Openings</h3>
              <Table columns={doorOpeningColumns} data={doorData.openings} />
            </div>
          </div>
        )}

        {statusData && (
          <div className="results-content">
            <h2>Status Lookup Results</h2>
            <div className="clients-table-container">
              <h3>Registered Devices ({statusData.registered_devices.length})</h3>
              <Table columns={statusColumns} data={statusData.registered_devices.map(d => ({...d, id: d.serial}))} />
            </div>
            {statusData.test_devices.length > 0 && (
              <div className="clients-table-container">
                <h3>Test Devices ({statusData.test_devices.length})</h3>
                <Table columns={statusColumns} data={statusData.test_devices.map(d => ({...d, id: d.serial}))} />
              </div>
            )}
          </div>
        )}

        {hasSearched && !isLoading && !error && !doorData && !statusData && (
           <p className="info-text">No data found for the specified parameters.</p>
        )}
      </div>
    </div>
  );
};

export default DeviceAnalyticsPage;

