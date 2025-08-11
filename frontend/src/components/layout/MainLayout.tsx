import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import AnimatedBackground from './AnimatedBackground';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
  onNavigate: (page: 'dashboard' | 'settings' | 'allClients') => void;
  currentPage: 'dashboard' | 'settings' | 'allClients';
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onNavigate, currentPage }) => {
  return (
    <div className="main-layout">
      <AnimatedBackground />
      <Navbar onNavigate={onNavigate} currentPage={currentPage} />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
