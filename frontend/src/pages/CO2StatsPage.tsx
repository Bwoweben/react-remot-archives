/*
================================================================================
File: src/pages/CO2StatsPage.tsx
Description: The complete component for the CO2 Emissions page, redesigned to
             use the Celery background task system for a non-blocking UI.
================================================================================
*/
import React, { useState, useMemo, useCallback } from 'react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import StatCard from '../components/common/StatCard';
import { useMockFetch } from '../hooks/useMockFetch';
import { fetchCO2Stats, fetchMonthlyCO2Stats, startMonthlyCO2Task } from '../services/co2Api';
import { type CO2StatsResponse, 
    type CO2ClientData, 
    type MonthlyCO2Data } from '../types';
import './CO2StatsPage.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTaskPolling } from '../hooks/useTaskPolling';

const CO2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 8h.01"/><path d="M12 12h.01"/><path d="M12 16h.01"/></svg>;

const CO2StatsPage: React.FC = () => {
  const { data: annualData, isLoading: isLoadingAnnual, error: annualError } = useMockFetch<CO2StatsResponse>(fetchCO2Stats);

  const [clientId, setClientId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyCO2Data[] | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSuccess = useCallback(async () => {
    try {
      const result = await fetchMonthlyCO2Stats(parseInt(clientId), year, month);
      setMonthlyData(result.data);
    } catch (err) {
      setFormError("Failed to retrieve completed data.");
    } finally {
      setActiveTaskId(null);
    }
  }, [clientId, year, month]);

  const handleError = () => {
    setFormError("The calculation task failed. Please try again.");
    setActiveTaskId(null);
  };

  const taskStatus = useTaskPolling(activeTaskId, handleSuccess, handleError);

  const handleMonthlyAnalysis = async () => {
    if (!clientId) {
      setFormError("Please enter a Client ID.");
      return;
    }
    setFormError(null);
    setMonthlyData(null);
    try {
      const response = await startMonthlyCO2Task(parseInt(clientId), year, month);
      setActiveTaskId(response.task_id);
    } catch (err) {
      setFormError("Failed to submit the calculation task.");
    }
  };

  const monthlyTotalCO2 = useMemo(() => {
    if (!monthlyData) return 0;
    return monthlyData.reduce((sum, day) => sum + day.CO2_emissions, 0);
  }, [monthlyData]);

  const annualColumns = useMemo(() => [
    { Header: 'Client ID', accessor: (row: CO2ClientData) => row.client_id },
    { Header: 'Year', accessor: (row: CO2ClientData) => row.year },
    { Header: 'Total Energy (kWh)', accessor: (row: CO2ClientData) => row.total_energy.toFixed(2) },
    { Header: 'Est. CO2 Emissions (tCO2e)', accessor: (row: CO2ClientData) => row.total_CO2.toFixed(4) },
  ], []);
  
  const monthlyColumns = useMemo(() => [
    { Header: 'Day', accessor: (row: MonthlyCO2Data) => row.day },
    { Header: 'Device Serial', accessor: (row: MonthlyCO2Data) => row.serial },
    { Header: 'Energy (kWh)', accessor: (row: MonthlyCO2Data) => row.energy_per_day.toFixed(2) },
    { Header: 'CO2 Emissions (tCO2e)', accessor: (row: MonthlyCO2Data) => row.CO2_emissions.toFixed(4) },
  ], []);

  return (
    <div className="co2-stats-page">
      <h1 className="page-title">Client CO2 Emissions</h1>
      
      <div className="clients-table-container">
        <h2>Annual Summary (All Clients)</h2>
        {isLoadingAnnual && <p className="info-text">Loading annual data...</p>}
        {annualError && <p className="error-text">{annualError}</p>}
        {annualData && <Table columns={annualColumns} data={annualData.data.map(d => ({...d, id: `${d.client_id}-${d.year}`}))} />}
      </div>

      <div className="deep-dive-section">
        <h2>Monthly Deep Dive (Single Client)</h2>
        <div className="search-form-container">
          <Input id="clientId" label="Client ID" placeholder="e.g., 93" value={clientId} onChange={(e) => setClientId(e.target.value)} />
          <Input id="year" label="Year" type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} />
          <Input id="month" label="Month" type="number" min="1" max="12" value={month} onChange={(e) => setMonth(parseInt(e.target.value))} />
          <Button onClick={handleMonthlyAnalysis} disabled={!!activeTaskId}>
            {taskStatus === 'PENDING' ? 'Calculation in Progress...' : 'Start Monthly Calculation'}
          </Button>
        </div>

        {formError && <p className="error-text">{formError}</p>}

        {taskStatus === 'PENDING' && (
          <div className="task-status-container">
            <div className="spinner"></div>
            <p>Task is running in the background. You can navigate away and check back later.</p>
            <p><strong>Task ID:</strong> {activeTaskId}</p>
          </div>
        )}
        
        {monthlyData && (
          <div className="monthly-results">
            {monthlyData.length > 0 ? (
              <>
                <StatCard title="Total Emissions for Selected Month" value={`${monthlyTotalCO2.toFixed(4)} tCO2e`} icon={<CO2Icon />} />
                <div className="logs-chart">
                  <h3>Daily Emissions Trend</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="day" stroke="#a0a0a0" />
                      <YAxis stroke="#a0a0a0" />
                      <Tooltip contentStyle={{ backgroundColor: '#2f2f2f', border: '1px solid #444' }} />
                      <Legend />
                      <Line type="monotone" dataKey="CO2_emissions" name="CO2 (tCO2e)" stroke="#82ca9d" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="clients-table-container">
                  <h3>Daily Breakdown</h3>
                  <Table columns={monthlyColumns} data={monthlyData.map(d => ({...d, id: `${d.serial}-${d.day}`}))} />
                </div>
              </>
            ) : (
              <p className="info-text">Calculation complete, but no data was found for this client for the selected month.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CO2StatsPage;
