import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
  onNavigate: (page: 'dashboard' | 'settings' | 'allClients') => void;
}

// This component creates the animated background
const AnimatedBackground: React.FC = () => (
  <div className="background-container">
    <div className="shape"></div>
    <div className="shape"></div>
    <div className="shape"></div>
    <div className="shape"></div>
    <div className="shape"></div>
    <div className="shape"></div>
  </div>
);

const MainLayout: React.FC<MainLayoutProps> = ({ children, onNavigate }) => {
  return (
    <div className="main-layout">
      <AnimatedBackground />
      <Navbar onNavigate={onNavigate} />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
