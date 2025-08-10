import React from 'react';
import './StatCard.css';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'green' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const valueClassName = `stat-value ${color ? `stat-value-${color}` : ''}`;
  
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className={valueClassName}>{value}</p>
      </div>
    </div>
  );
};

export default StatCard;

