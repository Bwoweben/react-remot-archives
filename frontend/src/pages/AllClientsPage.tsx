import React, { useState, useMemo } from 'react';
import { useMockFetch } from '../hooks/useMockFetch';
import { fetchAllClientsStats } from '../services/statsApi';
import { type AllClientsResponse, type ClientDeviceStats } from '../types';
import Table from '../components/common/Table';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import './AllClientsPage.css';

const AllClientsPage: React.FC = () => {
  const { data, isLoading, error } = useMockFetch<AllClientsResponse>(fetchAllClientsStats);
  const [filter, setFilter] = useState('');

  // useMemo will re-calculate the filtered data only when the data or filter changes.
  const filteredClients = useMemo(() => {
    if (!data) return [];
    return data.clients.filter(client =>
      `${client.first_name} ${client.last_name}`.toLowerCase().includes(filter.toLowerCase())
    );
  }, [data, filter]);

  // Define the columns for our new Table component
  const columns = useMemo(() => [
    {
      Header: 'Name',
      accessor: (row: ClientDeviceStats) => `${row.first_name} ${row.last_name}`,
    },
    {
      Header: 'Country',
      accessor: (row: ClientDeviceStats) => row.country || 'N/A',
    },
    {
      Header: 'Total Devices',
      accessor: (row: ClientDeviceStats) => row.no_of_devices,
    },
    {
      Header: 'Online',
      accessor: (row: ClientDeviceStats) => <span className="status-online">{row.online}</span>,
    },
    {
      Header: 'Offline',
      accessor: (row: ClientDeviceStats) => <span className="status-offline">{row.offline}</span>,
    },
  ], []);

  if (isLoading) return <p>Loading client data...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!data) return <p>No data found.</p>;

  return (
    <div className="all-clients-page">
      <h1>All Clients Overview</h1>
      
      {/* Summary Cards Section */}
      <div className="summary-cards">
        <Card title="Total Devices">
          <p className="summary-value">{data.total_devices}</p>
        </Card>
        <Card title="Online">
          <p className="summary-value status-online">{data.total_online}</p>
        </Card>
        <Card title="Offline">
          <p className="summary-value status-offline">{data.total_offline}</p>
        </Card>
      </div>

      {/* Client List Table Section */}
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