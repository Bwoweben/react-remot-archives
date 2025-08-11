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

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <MainLayout onNavigate={setCurrentPage} currentPage={currentPage}>
      {currentPage === 'dashboard' && <DashboardPage />}
      {currentPage === 'settings' && <SettingsPage />}
      {currentPage === 'allClients' && <AllClientsPage />}
    </MainLayout>
  );
}

export default App;
