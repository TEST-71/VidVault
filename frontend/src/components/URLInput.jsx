import React, { useState } from 'react';
import { videoService } from '../services/api';

const URLInput = ({ onSuccess, onLoading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      setLoading(true);
      onLoading(true);

      // Validate URL first
      await videoService.validateUrl(url);

      // Get video info
      const response = await videoService.getVideoInfo(url);

      if (response.data.success) {
        onSuccess(response.data.data);
      } else {
        setError(response.data.error || 'Failed to fetch video information');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid URL or unsupported platform');
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste video URL here (YouTube, Instagram, TikTok, etc.)"
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: loading ? '#9ca3af' : '#7c3aed',
              color: '#ffffff',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {loading ? '⏳' : '⬇️'} {loading ? 'Processing...' : 'Download'}
          </button>
        </div>
        {error && (
          <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#fee2e2', border: '1px solid #fecaca', borderRadius: '0.5rem', display: 'flex', gap: '0.5rem', color: '#991b1b' }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>
    </form>
  );
};

export default URLInput;
