import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; // The '?' makes the label prop optional
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div className="input-group">
      {/* Only render the label if it's provided */}
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <input id={id} className="custom-input" {...props} />
    </div>
  );
};

export default Input;