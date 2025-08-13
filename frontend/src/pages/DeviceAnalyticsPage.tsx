import React, { useState, useMemo, useEffect } from 'react';
import Button from '../components/common/Button';
import StatCard from '../components/common/StatCard';
import Table from '../components/common/Table';
import { fetchDoorOpeningStats, fetchMultiDeviceStatus, fetchLogCount, fetchRecentLogs } from '../services/deviceApi';
import { type DoorOpeningStats, 
    type MultiDeviceStatusResponse, 
    type DeviceStatus, 
    type LogCountResponse, 
    type LogCountResult, 
    type DeviceLog } from '../types';
import './DeviceAnalyticsPage.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type AnalyticsMode = 'singleDevice' | 'multiDevice';

// --- SVG Icons ---
const DoorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14"/><path d="M10 12h4"/></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

const DeviceAnalyticsPage: React.FC = () => {
  const [mode, setMode] = useState<AnalyticsMode>('singleDevice');
  const [identifiers, setIdentifiers] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // --- State for results ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [logsData, setLogsData] = useState<DeviceLog[] | null>(null);
  const [statusData, setStatusData] = useState<MultiDeviceStatusResponse | null>(null);
  const [logCountData, setLogCountData] = useState<LogCountResponse | null>(null);
  
  // --- State for the secondary "deep dive" analysis ---
  const [isLoadingDoorData, setIsLoadingDoorData] = useState(false);
  const [doorData, setDoorData] = useState<DoorOpeningStats | null>(null);

  // --- State for the chart controls ---
  const [selectedChartParams, setSelectedChartParams] = useState<string[]>(['panel_voltage', 'panel_current']);

  useEffect(() => {
    const ids = inputValue.trim().split(/[\s,]+/).filter(Boolean);
    setIdentifiers(ids);
    setMode(ids.length > 1 ? 'multiDevice' : 'singleDevice');
  }, [inputValue]);

  const handleRemoveIdentifier = (idToRemove: string) => {
    const newIds = identifiers.filter(id => id !== idToRemove);
    setInputValue(newIds.join(' '));
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setLogsData(null);
    setStatusData(null);
    setLogCountData(null);
    setDoorData(null);

    try {
      if (mode === 'singleDevice' && identifiers.length === 1) {
        const result = await fetchRecentLogs(identifiers[0]);
        setLogsData(result.logs);
      } else if (mode === 'multiDevice' && identifiers.length > 0) {
        const [statusResult, logCountResult] = await Promise.all([
          fetchMultiDeviceStatus(identifiers),
          fetchLogCount(identifiers)
        ]);
        setStatusData(statusResult);
        setLogCountData(logCountResult);
      } else {
        setError("Please enter at least one device identifier.");
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeDoorOpenings = async () => {
    if (identifiers.length !== 1) return;
    setIsLoadingDoorData(true);
    setDoorData(null);
    try {
      const result = await fetchDoorOpeningStats(identifiers[0], date);
      setDoorData(result);
    } catch (err: any) {
      setError("Could not load door opening data.");
    } finally {
      setIsLoadingDoorData(false);
    }
  };

  const handleChartParamChange = (param: string) => {
    setSelectedChartParams(prev => {
      const isSelected = prev.includes(param);
      if (isSelected) {
        return prev.filter(p => p !== param);
      } else {
        return prev.length < 2 ? [...prev, param] : prev;
      }
    });
  };

  // --- Table Columns ---
  const logsColumns = useMemo(() => [
    { Header: 'Timestamp', accessor: (row: DeviceLog) => new Date(row.time_stamp).toLocaleString() },
    { Header: 'Panel (V)', accessor: (row: DeviceLog) => row.panel_voltage?.toFixed(2) ?? 'N/A' },
    { Header: 'Supply (V)', accessor: (row: DeviceLog) => row.supply_voltage?.toFixed(2) ?? 'N/A' },
    { Header: 'Battery (V)', accessor: (row: DeviceLog) => row.battery_voltage?.toFixed(2) ?? 'N/A' },
    { Header: 'Extras', accessor: (row: DeviceLog) => row.extras ?? 'N/A' },
  ], []);

  const statusColumns = useMemo(() => [
    { Header: '#', accessor: (row: DeviceStatus) => row.No },
    { Header: 'Serial', accessor: (row: DeviceStatus) => row.serial },
    { Header: 'Owner', accessor: (row: DeviceStatus) => `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'N/A' },
    { Header: 'Last Log', accessor: (row: DeviceStatus) => row.last_log ? new Date(row.last_log).toLocaleString() : 'Never' },
    { Header: 'Offline (Days)', accessor: (row: DeviceStatus) => row.log_duration ?? 'N/A' },
  ], []);

  const logCountColumns = useMemo(() => [
    { Header: '#', accessor: (row: LogCountResult) => row.No },
    { Header: 'Serial', accessor: (row: LogCountResult) => row.serial },
    { Header: 'Owner', accessor: (row: LogCountResult) => `${row.first_name} ${row.last_name}` },
    { Header: 'Logs (Last 3h)', accessor: (row: LogCountResult) => row.log_count },
    { Header: 'Last Log', accessor: (row: LogCountResult) => new Date(row.last_log!).toLocaleString() },
  ], []);

  const doorOpeningColumns = useMemo(() => [
    { Header: '#', accessor: (row: any) => row.id },
    { Header: 'Timestamp', accessor: (row: any) => new Date(row.timestamp).toLocaleString() },
    { Header: 'Duration (seconds)', accessor: (row: any) => row.duration_seconds.toFixed(2) },
  ], []);
  
  const chartableParams = [
    { key: 'panel_voltage', name: 'Panel (V)', color: '#8884d8' },
    { key: 'panel_current', name: 'Panel (A)', color: '#82ca9d' },
    { key: 'battery_voltage', name: 'Battery (V)', color: '#ffc658' },
    { key: 'supply_voltage', name: 'Supply (V)', color: '#ff8042' },
  ];

  return (
    <div className="device-analytics-page">
      <h1 className="page-title">Device Analytics</h1>
      
      <div className="analytics-command-bar">
        <div className="command-input-wrapper">
          <div className="identifier-tags">
            {identifiers.map(id => (
              <span key={id} className="identifier-tag">
                {id}
                <button onClick={() => handleRemoveIdentifier(id)}><CloseIcon /></button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Enter one or more device identifiers..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="command-input"
          />
        </div>
        
        {mode === 'singleDevice' && (
          <div className="date-picker-wrapper">
            <label htmlFor="date">Analysis Date</label>
            <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        )}

        <Button onClick={handleSearch} disabled={isLoading || identifiers.length === 0}>
          {isLoading ? 'Analyzing...' : 
           mode === 'singleDevice' ? 'View Recent Logs' : `Analyze ${identifiers.length} Devices`}
        </Button>
      </div>

      <div className="results-container">
        {!hasSearched && <p className="info-text">Enter device identifiers to begin analysis.</p>}
        {isLoading && <p className="info-text">Loading data...</p>}
        {error && <p className="error-text">{error}</p>}
        
        {logsData && (
          <div className="results-content">
            <h2>Recent Logs for {identifiers[0]}</h2>
            <div className="logs-content-wrapper">
              <div className="chart-controls">
                <p>Visualize up to 2 parameters:</p>
                <div className="param-pills">
                  {chartableParams.map(param => (
                    <button
                      key={param.key}
                      onClick={() => handleChartParamChange(param.key)}
                      className={`param-pill ${selectedChartParams.includes(param.key) ? 'active' : ''}`}
                      disabled={!selectedChartParams.includes(param.key) && selectedChartParams.length >= 2}
                    >
                      {param.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="logs-chart">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={logsData.slice().reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="time_stamp" tickFormatter={(ts) => new Date(ts).toLocaleTimeString()} stroke="#a0a0a0" />
                    <YAxis stroke="#a0a0a0" />
                    <Tooltip contentStyle={{ backgroundColor: '#2f2f2f', border: '1px solid #444' }} />
                    <Legend />
                    {chartableParams.map(param => 
                      selectedChartParams.includes(param.key) && (
                        <Line key={param.key} type="monotone" dataKey={param.key} name={param.name} stroke={param.color} dot={false} />
                      )
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="logs-table">
                <Table columns={logsColumns} data={logsData.map((log, i) => ({...log, id: i}))} />
              </div>
            </div>

            <div className="deep-dive-section">
              <h3>Deep Dive Analysis</h3>
              <div className="deep-dive-controls">
                <p>Analyze door openings for this device on the selected date.</p>
                <Button onClick={handleAnalyzeDoorOpenings} disabled={isLoadingDoorData}>
                  {isLoadingDoorData ? "Analyzing..." : "Analyze Door Openings"}
                </Button>
              </div>
              {isLoadingDoorData && <p className="info-text">Loading door data...</p>}
              {doorData && (
                <div className="door-results">
                  <div className="summary-cards">
                    <StatCard title="Total Door Openings" value={doorData.total_openings} icon={<DoorIcon />} />
                    <StatCard title="Avg. Duration (sec)" value={doorData.average_duration_seconds.toFixed(1)} icon={<ClockIcon />} />
                  </div>
                  <div className="clients-table-container">
                    <h4>Individual Openings on {doorData.date}</h4>
                    <Table columns={doorOpeningColumns} data={doorData.openings} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {statusData && logCountData && (
          <div className="results-content">
            <h2>Multi-Device Analysis Results</h2>
            <div className="clients-table-container">
              <h3>Status Lookup</h3>
              <Table columns={statusColumns} data={statusData.registered_devices.map(d => ({...d, id: d.serial}))} />
            </div>
            {statusData.test_devices.length > 0 &&
              <div className="clients-table-container">
                <h3>Test Devices</h3>
                <Table columns={statusColumns} data={statusData.test_devices.map(d => ({...d, id: d.serial}))} />
              </div>
            }
            <div className="clients-table-container">
              <h3>Log Count (3h before last log)</h3>
              <Table columns={logCountColumns} data={logCountData.data.map(d => ({...d, id: d.serial}))} />
            </div>
          </div>
        )}

        {hasSearched && !isLoading && !error && !logsData && !statusData && (
           <p className="info-text">No data found for the specified parameters.</p>
        )}
      </div>
    </div>
  );
};

export default DeviceAnalyticsPage;
