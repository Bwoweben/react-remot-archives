import React, { useMemo } from 'react';
import { useMockFetch } from '../hooks/useMockFetch';
import { fetchCO2Stats } from '../services/co2Api';
import { type CO2StatsResponse, type CO2ClientData } from '../types';
import Table from '../components/common/Table';

const CO2StatsPage: React.FC = () => {
  const { data, isLoading, error } = useMockFetch<CO2StatsResponse>(fetchCO2Stats);

  // Define the columns for the table
  const columns = useMemo(() => [
    { Header: 'Client ID', accessor: (row: CO2ClientData) => row.client_id },
    { Header: 'Year', accessor: (row: CO2ClientData) => row.year },
    { Header: 'Total Energy (kWh)', accessor: (row: CO2ClientData) => row.total_energy.toFixed(2) },
    { Header: 'Est. CO2 Emissions (tCO2e)', accessor: (row: CO2ClientData) => row.total_CO2.toFixed(4) },
  ], []);

  // ** THE FIX IS HERE **
  // We use useMemo to transform the data only when it changes.
  // We map over the original data and add a unique 'id' to each object.
  const tableData = useMemo(() => {
    if (!data) return [];
    return data.data.map(row => ({
      ...row,
      id: `${row.client_id}-${row.year}` // Create a unique ID like "client123-2025"
    }));
  }, [data]);

  if (isLoading) return <p>Calculating CO2 emissions...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!data) return <p>No data found.</p>;

  return (
    <div className="co2-stats-page">
      <h1 className="page-title">Client Annual CO2 Emissions</h1>
      <div className="clients-table-container"> {/* Reusing class from AllClientsPage for consistency */}
        <Table columns={columns} data={tableData} />
      </div>
    </div>
  );
};

export default CO2StatsPage;