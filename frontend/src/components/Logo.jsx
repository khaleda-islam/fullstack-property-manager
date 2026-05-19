// frontend/src/components/Logo.jsx
import React from 'react';
import logo from '../assets/logo.jpeg';

const Logo = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center',
      alignItems: 'center',
      padding: '30px 20px',
      backgroundColor: 'white'
    }}>
      <img 
        src={logo} 
        alt="Property Management System Logo"
        style={{
          height: '150px',           
          width: 'auto',
          borderRadius: '20px',      
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
          objectFit: 'contain'
        }}
      />
    </div>
  );
};

export default Logo;