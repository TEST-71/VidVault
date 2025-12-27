import React, { useState } from 'react';

export const QualitySelector = ({ video, onDownload, loading }) => {
  const [selectedType, setSelectedType] = useState('video');
  const [selectedQuality, setSelectedQuality] = useState(
    video.availableFormats[selectedType][0]?.quality
  );
  const [selectedFormat, setSelectedFormat] = useState(
    video.availableFormats[selectedType][0]?.format
  );

  const currentFormats = video.availableFormats[selectedType] || [];
  const selectedItem = currentFormats.find(
    (f) => f.quality === selectedQuality && f.format === selectedFormat
  );

  const handleDownload = () => {
    onDownload({
      type: selectedType,
      quality: selectedQuality,
      format: selectedFormat,
    });
  };

  const getFormatsByQuality = () => {
    return currentFormats.filter((f) => f.quality === selectedQuality);
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>Download Options</h3>

      {/* Content Type Selection */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.75rem' }}>
          What would you like to download?
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {['video', 'audio'].map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedType(type);
                setSelectedQuality(video.availableFormats[type][0]?.quality);
                setSelectedFormat(video.availableFormats[type][0]?.format);
              }}
              style={{
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '2px solid',
                borderColor: selectedType === type ? '#7c3aed' : '#d1d5db',
                backgroundColor: selectedType === type ? 'rgba(124, 58, 237, 0.05)' : 'white',
                color: selectedType === type ? '#7c3aed' : '#374151',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
            >
              {type === 'video' ? '🎬 Video' : '🎵 Audio Only'}
            </button>
          ))}
        </div>
      </div>

      {/* Quality Selection */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.75rem' }}>
          Quality
        </label>
        <div style={{ position: 'relative' }}>
          <select
            value={selectedQuality}
            onChange={(e) => {
              setSelectedQuality(e.target.value);
              const formats = video.availableFormats[selectedType].filter(
                (f) => f.quality === e.target.value
              );
              if (formats.length > 0) {
                setSelectedFormat(formats[0].format);
              }
            }}
            style={{
              width: '100%',
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              appearance: 'none',
              paddingRight: '2.5rem'
            }}
          >
            {video.availableFormats[selectedType].map((format) => (
              <option key={format.quality} value={format.quality}>
                {format.quality} ({format.fileSizeFormatted})
              </option>
            ))}
          </select>
          <span style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }}>▼</span>
        </div>
      </div>

      {/* Format Selection */}
      {getFormatsByQuality().length > 1 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.75rem' }}>
            Format
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {getFormatsByQuality().map((format) => (
              <button
                key={format.format}
                onClick={() => setSelectedFormat(format.format)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  border: '2px solid',
                  borderColor: selectedFormat === format.format ? '#7c3aed' : '#d1d5db',
                  backgroundColor: selectedFormat === format.format ? '#7c3aed' : 'white',
                  color: selectedFormat === format.format ? 'white' : '#374151',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s'
                }}
              >
                {format.format}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Item Info */}
      {selectedItem && (
        <div style={{ marginBottom: '1.5rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', padding: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem', marginTop: '0.125rem' }}>💾</span>
            <div>
              <p style={{ fontWeight: '600', color: '#1e3a8a' }}>
                {selectedItem.quality} {selectedItem.format.toUpperCase()}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#1e40af' }}>
                Estimated size: <strong>{selectedItem.fileSizeFormatted}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={loading}
        style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: loading ? 'rgba(124, 58, 237, 0.5)' : '#7c3aed',
          color: 'white',
          borderRadius: '0.5rem',
          border: 'none',
          fontWeight: '600',
          fontSize: '1.125rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          opacity: loading ? 0.5 : 1
        }}
        onMouseEnter={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = '#6d28d9';
        }}
        onMouseLeave={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = '#7c3aed';
        }}
      >
        {loading ? '⏳ Preparing Download...' : '⬇️ Download Now'}
      </button>
    </div>
  );
};

export default QualitySelector;
