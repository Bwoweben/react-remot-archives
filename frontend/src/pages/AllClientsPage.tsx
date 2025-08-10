// src/pages/AllClientsPage.tsx
import React from 'react';
import { useMockFetch } from '../hooks/useMockFetch'; // Or a real fetch hook
import { fetchAllClientsStats } from '../services/statsApi';
import { type AllClientsResponse } from '../types';

const AllClientsPage: React.FC = () => {
  // NOTE: This uses the mock fetch hook for simplicity, but it will call the real API.
  const { data, isLoading, error } = useMockFetch<AllClientsResponse>(fetchAllClientsStats);

  if (isLoading) return <p>Loading client data...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
if (!data) return <p>No data found.</p>;

  return (
    <div>
      <h1>All Clients Overview</h1>
      
      {/* Summary Section */}
      <div className="summary-cards">
        <div className="card">
          <h2>{data.total_devices}</h2>
          <p>Total Devices</p>
        </div>
        <div className="card">
          <h2 style={{ color: 'lightgreen' }}>{data.total_online}</h2>
          <p>Online</p>
        </div>
        <div className="card">
          <h2 style={{ color: 'lightcoral' }}>{data.total_offline}</h2>
          <p>Offline</p>
        </div>
      </div>

      {/* Client List Table */}
      <h2>Client Details</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Country</th>
            <th>Total Devices</th>
            <th>Online</th>
            <th>Offline</th>
          </tr>
        </thead>
        <tbody>
          {data.clients.map(client => (
            <tr key={client.id}>
              <td>{client.first_name} {client.last_name}</td>
              <td>{client.country}</td>
              <td>{client.no_of_devices}</td>
              <td>{client.online}</td>
              <td>{client.offline}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllClientsPage;