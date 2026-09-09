import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png';
import './assets/styles.css';

export default function Logo() {
  const navigate = useNavigate();

  return (
    <div 
      className="logo-container" 
      onClick={() => navigate('/customerhome')}
      style={{ cursor: 'pointer' }}
    >
      <img
        src={logo}
        alt="SalesSavvy Logo"
        className="logo-image"
        onError={(e) => {
          e.target.onerror = null; // Prevent infinite error loops
          e.target.src = '/fallback-logo.png';
        }}
      />
      <span className="logo-text">SalesSavvy</span>
    </div>
  );
}