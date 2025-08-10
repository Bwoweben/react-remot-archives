import React from 'react';
// Make sure you have a Button.css file for styles
// import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button className="custom-button" {...props}>
      {children}
    </button>
  );
};

export default Button;
