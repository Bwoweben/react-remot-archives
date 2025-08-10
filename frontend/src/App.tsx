import { useState } from 'react';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import AllClientsPage from './pages/AllClientsPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'settings' | 'allClients'>('dashboard');

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // The LoginPage does not use the MainLayout
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // All other pages are wrapped by the MainLayout
  return (
    <MainLayout onNavigate={setCurrentPage}>
      {currentPage === 'dashboard' && <DashboardPage />}
      {currentPage === 'settings' && <SettingsPage />}
      {currentPage === 'allClients' && <AllClientsPage />}
    </MainLayout>
  );
}

export default App;