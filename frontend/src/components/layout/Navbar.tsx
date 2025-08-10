import React from 'react';
import Button from '../common/Button';
import './Navbar.css';

interface NavbarProps {
  onNavigate: (page: 'dashboard' | 'settings' | 'allClients') => void;
}

// A simple SVG logo component
const Logo: React.FC = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12H6L9 4L15 20L18 12H21" stroke="#646cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Logo />
        <h1>IoT Dashboard</h1>
      </div>
      <div className="navbar-links">
        <Button onClick={() => onNavigate('dashboard')}>Dashboard</Button>
        <Button onClick={() => onNavigate('allClients')}>All Clients</Button>
        <Button onClick={() => onNavigate('settings')}>Settings</Button>
      </div>
    </nav>
  );
};

export default Navbar;
