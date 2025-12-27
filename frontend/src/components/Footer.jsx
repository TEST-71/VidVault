import React from 'react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#111827', color: '#d1d5db', marginTop: '4rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', marginBottom: '2rem' }}>
          {/* Brand */}
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '0.5rem' }}>VidVault</h3>
            <p style={{ fontSize: '0.875rem' }}>Download videos and audio from your favorite platforms.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontWeight: '600', color: '#ffffff', marginBottom: '1rem' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}><a href="#" style={{ color: '#d1d5db', textDecoration: 'none' }}>Home</a></li>
              <li style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}><a href="#" style={{ color: '#d1d5db', textDecoration: 'none' }}>About</a></li>
              <li style={{ fontSize: '0.875rem' }}><a href="#" style={{ color: '#d1d5db', textDecoration: 'none' }}>FAQ</a></li>
            </ul>
          </div>

          {/* Supported Platforms */}
          <div>
            <h4 style={{ fontWeight: '600', color: '#ffffff', marginBottom: '1rem' }}>Platforms</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}><a href="#" style={{ color: '#d1d5db', textDecoration: 'none' }}>YouTube</a></li>
              <li style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}><a href="#" style={{ color: '#d1d5db', textDecoration: 'none' }}>Instagram</a></li>
              <li style={{ fontSize: '0.875rem' }}><a href="#" style={{ color: '#d1d5db', textDecoration: 'none' }}>TikTok</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 style={{ fontWeight: '600', color: '#ffffff', marginBottom: '1rem' }}>Legal</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}><a href="#" style={{ color: '#d1d5db', textDecoration: 'none' }}>Terms of Service</a></li>
              <li style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}><a href="#" style={{ color: '#d1d5db', textDecoration: 'none' }}>Privacy Policy</a></li>
              <li style={{ fontSize: '0.875rem' }}><a href="#" style={{ color: '#d1d5db', textDecoration: 'none' }}>DMCA</a></li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #374151', paddingTop: '2rem' }}>
          <p style={{ textAlign: 'center', fontSize: '0.875rem' }}>
            Made with ❤️ by VidVault Team
          </p>
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
            © 2025 VidVault. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
