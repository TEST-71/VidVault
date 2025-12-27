import React from 'react';

const Header = () => {
  console.log('Header rendering');
  return (
    <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', padding: '1rem', minHeight: '80px', display: 'flex', alignItems: 'center' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontSize: '2rem' }}>📥</div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>VidVault</h1>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Download videos and audio instantly</p>
          </div>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a href="#" style={{ color: '#374151', textDecoration: 'none' }}>GitHub</a>
          <a href="#" style={{ color: '#374151', textDecoration: 'none' }}>Support</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
