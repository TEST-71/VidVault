import React from 'react';

const Features = () => {
  const features = [
    {
      icon: '🎬',
      title: 'Multiple Formats',
      description: 'Download in MP4, WebM, MKV, MP3, M4A, WAV, OGG, and more.',
    },
    {
      icon: '🎯',
      title: 'Quality Selection',
      description: 'Choose from 240p to 4K resolution with custom audio bitrates.',
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Powered by yt-dlp and FFmpeg for maximum speed and reliability.',
    },
    {
      icon: '🔒',
      title: 'Privacy First',
      description: 'No account needed. Downloads are not stored on our servers.',
    },
    {
      icon: '🌐',
      title: 'Platform Support',
      description: 'Works with YouTube, Instagram, TikTok, Twitter, Facebook, and more.',
    },
    {
      icon: '📱',
      title: 'Mobile Friendly',
      description: 'Download directly to your device from any browser.',
    },
  ];

  return (
    <section style={{ padding: '3rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>Why Choose VidVault?</h2>
        <p style={{ color: '#4b5563', maxWidth: '42rem', margin: '0 auto' }}>
          The easiest way to download your favorite videos and audio from any platform.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {features.map((feature, index) => (
          <div key={index} style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>{feature.icon}</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>{feature.title}</h3>
            <p style={{ color: '#4b5563', fontSize: '0.875rem' }}>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
