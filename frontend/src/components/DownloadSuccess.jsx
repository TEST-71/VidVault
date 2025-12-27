import React from 'react';

export const DownloadSuccess = ({ jobId }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(jobId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
        <span style={{ fontSize: '4rem' }}>✅</span>
      </div>
      
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Download Started!</h2>
      <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
        Your file is being processed and will be ready shortly.
      </p>

      <div style={{ backgroundColor: '#f3f4f6', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>Job ID</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <code style={{ flex: 1, fontSize: '0.875rem', fontFamily: 'monospace', color: '#111827', wordBreak: 'break-all' }}>{jobId}</code>
          <button
            onClick={handleCopy}
            style={{
              padding: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '0.25rem',
              transition: 'all 0.2s',
              fontSize: '1.5rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Copy to clipboard"
          >
            📋
          </button>
        </div>
        {copied && <p style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.5rem' }}>✓ Copied to clipboard!</p>}
      </div>

      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
        🔔 Your download will appear in your downloads folder automatically.
      </p>

      <button
        onClick={() => window.location.reload()}
        style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: '#7c3aed',
          color: 'white',
          borderRadius: '0.5rem',
          border: 'none',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6d28d9'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
      >
        Download Another Video
      </button>
    </div>
  );
};

export default DownloadSuccess;
