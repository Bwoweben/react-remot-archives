// src/components/layout/Navbar.tsx
import React from 'react';
import Button from '../common/Button';
import './Navbar.css';

interface NavbarProps {
  // 1. Update the type to include 'allClients'
  onNavigate: (page: 'dashboard' | 'settings' | 'allClients') => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">IoT Dashboard</div>
      <div className="navbar-links">
        <Button onClick={() => onNavigate('dashboard')}>Dashboard</Button>
        {/* 2. Add the new button */}
        <Button onClick={() => onNavigate('allClients')}>All Clients</Button>
        <Button onClick={() => onNavigate('settings')}>Settings</Button>
      </div>
    </nav>
  );
};

export default Navbar;