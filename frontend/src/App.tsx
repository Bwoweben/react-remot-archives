import { useState } from 'react';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import AllClientsPage from './pages/AllClientsPage';
import CO2StatsPage from './pages/CO2StatsPage';
import DeviceAnalyticsPage from './pages/DeviceAnalyticsPage';
import { type Page } from './types/navigation'; // Import the shared type

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard'); // Use the shared type

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <MainLayout onNavigate={setCurrentPage} currentPage={currentPage}>
      {currentPage === 'dashboard' && <DashboardPage />}
      {currentPage === 'settings' && <SettingsPage />}
      {currentPage === 'allClients' && <AllClientsPage />}
      {currentPage === 'co2' && <CO2StatsPage />}
      {currentPage === 'deviceAnalytics' && <DeviceAnalyticsPage />}
    </MainLayout>
  );
}

export default App;
