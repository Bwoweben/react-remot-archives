// src/App.tsx
import { useState } from 'react';
import Navbar from './components/layout/Navbar';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import AllClientsPage from './pages/AllClientsPage'; // 1. Import the new page

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // 2. Add 'allClients' to the possible page states
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'settings' | 'allClients'>('dashboard');

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app">
      <Navbar onNavigate={setCurrentPage} />
      <main className="content">
        {/* 3. Add a new condition to render the AllClientsPage */}
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'settings' && <SettingsPage />}
        {currentPage === 'allClients' && <AllClientsPage />}
      </main>
    </div>
  );
}

export default App;