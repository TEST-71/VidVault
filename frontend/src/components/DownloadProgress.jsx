import React, { useEffect, useState } from 'react';
import { videoService } from '../services/api';

export const DownloadProgress = ({ jobId, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('processing');
  const [eta, setEta] = useState('--:--');
  const [speed, setSpeed] = useState('-- MB/s');
  const [error, setError] = useState('');

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await videoService.getDownloadProgress(jobId);
        
        if (response.data.success) {
          const data = response.data.data;
          setProgress(data.progress);
          setStatus(data.status);
          setSpeed(data.downloadSpeed);
          
          // Format ETA
          if (data.eta) {
            const minutes = Math.floor(data.eta / 60);
            const seconds = data.eta % 60;
            setEta(`${minutes}:${seconds.toString().padStart(2, '0')}`);
          }

          if (data.status === 'completed') {
            clearInterval(interval);
            setTimeout(() => onComplete(jobId), 1000);
          }
        }
      } catch (err) {
        setError('Failed to fetch progress');
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [jobId, onComplete]);

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: '3rem', animation: 'spin 2s linear infinite', marginBottom: '1rem' }}>⏳</div>
        
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
          {status === 'completed' ? '✅ Download Complete!' : '⬇️ Downloading...'}
        </h2>

        {/* Progress Bar */}
        <div style={{ width: '100%', maxWidth: '28rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '100%', backgroundColor: '#d1d5db', borderRadius: '9999px', height: '0.75rem', overflow: 'hidden', marginBottom: '0.5rem' }}>
            <div
              style={{
                backgroundColor: '#7c3aed',
                height: '100%',
                transition: 'width 0.3s ease',
                width: `${progress}%`
              }}
            />
          </div>
          <p style={{ textAlign: 'center', fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>{progress}%</p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', width: '100%', maxWidth: '28rem', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: '#f3f4f6', padding: '0.75rem', borderRadius: '0.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Speed</p>
            <p style={{ fontWeight: '600', color: '#111827' }}>{speed}</p>
          </div>
          <div style={{ backgroundColor: '#f3f4f6', padding: '0.75rem', borderRadius: '0.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>ETA</p>
            <p style={{ fontWeight: '600', color: '#111827' }}>{eta}</p>
          </div>
        </div>

        {error && (
          <div style={{ width: '100%', maxWidth: '28rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.75rem', display: 'flex', gap: '0.5rem', color: '#991b1b', fontSize: '0.875rem' }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <p style={{ color: '#4b5563', fontSize: '0.875rem', marginTop: '1rem' }}>Job ID: {jobId}</p>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DownloadProgress;
