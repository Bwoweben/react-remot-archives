import React from 'react';
import Button from '../common/Button';
import Logo from '../common/Logo';
import './Navbar.css';

interface NavbarProps {
  onNavigate: (page: 'dashboard' | 'settings' | 'allClients') => void;
  currentPage: 'dashboard' | 'settings' | 'allClients';
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const navLinks = [
    { key: 'dashboard', name: 'Dashboard' },
    { key: 'allClients', name: 'All Clients' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Logo />
        <h1>IoT Dashboard</h1>
      </div>
      <div className="navbar-links">
        <div className="nav-text-links">
          {navLinks.map((link) => (
            <a
              key={link.key}
              className={`nav-link ${currentPage === link.key ? 'active' : ''}`}
              onClick={() => onNavigate(link.key as 'dashboard' | 'allClients')}
            >
              {link.name}
            </a>
          ))}
        </div>
        <Button onClick={() => onNavigate('settings')}>Settings</Button>
      </div>
    </nav>
  );
};

export default Navbar;

