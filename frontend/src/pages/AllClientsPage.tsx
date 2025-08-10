import React, { useState, useMemo } from 'react';
import { useMockFetch } from '../hooks/useMockFetch';
import { fetchAllClientsStats } from '../services/statsApi';
import { type AllClientsResponse, type ClientDeviceStats } from '../types';
import Table from '../components/common/Table';
import Input from '../components/common/Input';
import StatCard from '../components/common/StatCard'; // Import the new component
import './AllClientsPage.css';

// Simple SVG icons to pass to the StatCard component
const TotalDevicesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/><circle cx="12" cy="12" r="5"/></svg>;
const OnlineIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>;
const OfflineIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>;


const AllClientsPage: React.FC = () => {
  const { data, isLoading, error } = useMockFetch<AllClientsResponse>(fetchAllClientsStats);
  const [filter, setFilter] = useState('');

  const filteredClients = useMemo(() => {
    if (!data) return [];
    return data.clients.filter(client =>
      `${client.first_name} ${client.last_name}`.toLowerCase().includes(filter.toLowerCase())
    );
  }, [data, filter]);

  const columns = useMemo(() => [
    { Header: 'Name', accessor: (row: ClientDeviceStats) => `${row.first_name} ${row.last_name}` },
    { Header: 'Country', accessor: (row: ClientDeviceStats) => row.country || 'N/A' },
    { Header: 'Total Devices', accessor: (row: ClientDeviceStats) => row.no_of_devices },
    { Header: 'Online', accessor: (row: ClientDeviceStats) => <span className="status-online">{row.online}</span> },
    { Header: 'Offline', accessor: (row: ClientDeviceStats) => <span className="status-offline">{row.offline}</span> },
  ], []);

  if (isLoading) return <p>Loading client data...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!data) return <p>No data found.</p>;

  return (
    <div className="all-clients-page">
      <h1 className="page-title">All Clients Overview</h1>
      
      <div className="summary-cards">
        <StatCard title="Total Devices" value={data.total_devices} icon={<TotalDevicesIcon />} />
        <StatCard title="Online" value={data.total_online} icon={<OnlineIcon />} color="green" />
        <StatCard title="Offline" value={data.total_offline} icon={<OfflineIcon />} color="red" />
      </div>

      <div className="clients-table-container">
        <div className="table-header">
          <h2>Client Details ({filteredClients.length})</h2>
          <Input
            id="filter"
            type="text"
            placeholder="Search by name..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <Table columns={columns} data={filteredClients} />
      </div>
    </div>
  );
};

export default AllClientsPage;