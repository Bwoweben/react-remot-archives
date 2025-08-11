import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, fullWidth, ...props }) => {
  const className = `custom-button ${fullWidth ? 'full-width' : ''}`;
  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
};

export default Button;