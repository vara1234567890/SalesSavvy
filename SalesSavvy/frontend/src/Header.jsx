import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function ProfileDropdown({ username }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');

      // Notify backend if available (failures won't block logout)
      await fetch('https://salessavvy-d7qc.onrender.com/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      }).catch((err) => console.warn('Logout API notification bypassed:', err));
    } finally {
      // 1. Purge all stored tokens and user details
      localStorage.removeItem('token');
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('username');
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
      localStorage.clear();

      // 2. Close dropdown and route back to login screen
      setIsOpen(false);
      navigate('/');
    }
  };

  return (
    <div className="profile-dropdown-container" style={{ position: 'relative' }}>
      <button 
        type="button" 
        className="profile-btn" 
        onClick={() => setIsOpen((prev) => !prev)}
      >
        👤 {username || 'Guest'}
      </button>

      {isOpen && (
        <div 
          className="dropdown-menu" 
          style={{ 
            position: 'absolute', 
            right: 0, 
            marginTop: '8px', 
            zIndex: 1000 
          }}
        >
          <button 
            type="button" 
            className="dropdown-item logout-btn" 
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
