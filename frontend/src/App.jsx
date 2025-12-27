import { useState, useEffect } from 'react';
import { videoService } from './services/api.js';

export default function App() {
  const [step, setStep] = useState('input');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoData, setVideoData] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [jobId, setJobId] = useState(null);

  useEffect(() => {
    if (step === 'downloading' && jobId) {
      const pollProgress = async () => {
        try {
          const response = await videoService.getDownloadProgress(jobId);
          const { data } = response.data;
          
          setDownloadProgress(data.progress);
          
          if (data.status === 'completed') {
            setStep('success');
          } else if (data.status === 'failed') {
            setError('Download failed: ' + (data.error || 'Unknown error'));
            setStep('input');
          }
        } catch (err) {
          console.error('Error checking progress:', err);
        }
      };

      const interval = setInterval(pollProgress, 2000);
      return () => clearInterval(interval);
    }
  }, [step, jobId]);

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await videoService.getVideoInfo(url);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch video info');
      }

      const info = response.data.data;
      setVideoData(info);
      setStep('preview');
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch video information. Please check the URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartDownload = async (type, quality, format) => {
    setError('');
    setLoading(true);

    try {
      const response = await videoService.initiateDownload(url, type, quality, format);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to initiate download');
      }

      const newJobId = response.data.data.jobId;
      setJobId(newJobId);
      setStep('downloading');
      setDownloadProgress(0);
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to start download');
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async () => {
    try {
      window.location.href = `http://localhost:5000/api/download/file/${jobId}`;
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
      {/* HEADER */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1.5rem 1rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <h1 style={{ margin: 0, color: 'black', fontSize: '28px', fontWeight: 'bold' }}>📥 VidVault</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '14px' }}>Download videos and audio from any platform</p>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* INPUT STEP */}
          {step === 'input' && (
            <>
              <div style={{ maxWidth: '600px', margin: '0 auto', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'black', marginBottom: '1.5rem', textAlign: 'center' }}>
                  Download Videos & Audio
                </h2>
                
                <form onSubmit={handleDownload} style={{ marginBottom: '2rem' }}>
                  <input 
                    type="text" 
                    placeholder="Paste video URL here (YouTube, Instagram, TikTok, etc.)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      marginBottom: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                  <button 
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: loading ? '#d1d5db' : '#7c3aed',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {loading ? '⏳ Processing...' : '⬇️ Download'}
                  </button>
                </form>

                {error && (
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    borderRadius: '8px',
                    border: '1px solid #fecaca',
                    marginBottom: '2rem',
                    fontSize: '14px'
                  }}>
                    ⚠️ {error}
                  </div>
                )}
              </div>

              {/* FEATURES SECTION */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🎬</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '0.75rem', color: 'black' }}>Multiple Formats</h3>
                  <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>MP4, WebM, MP3, WAV, and many more formats</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🎯</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '0.75rem', color: 'black' }}>Quality Selection</h3>
                  <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Choose from 240p up to 4K resolution</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '1rem' }}>⚡</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '0.75rem', color: 'black' }}>Lightning Fast</h3>
                  <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Super quick downloads with no limitations</p>
                </div>
              </div>
            </>
          )}

          {/* PREVIEW STEP */}
          {step === 'preview' && videoData && (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <button 
                onClick={() => { setStep('input'); setUrl(''); }}
                style={{
                  marginBottom: '1.5rem',
                  padding: '10px 20px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}
              >
                ← Back
              </button>
              
              <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                {videoData.thumbnail && (
                  <img 
                    src={videoData.thumbnail} 
                    alt={videoData.title}
                    style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '400px', objectFit: 'cover' }}
                  />
                )}
                <div style={{ padding: '2rem' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '1rem', color: 'black' }}>
                    {videoData.title}
                  </h2>
                  <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '15px', lineHeight: '1.6' }}>
                    {videoData.description}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '8px' }}>
                      <p style={{ fontSize: '12px', color: '#666', margin: '0 0 0.5rem 0' }}>Duration</p>
                      <p style={{ fontWeight: 'bold', color: 'black', margin: 0, fontSize: '16px' }}>{videoData.durationFormatted}</p>
                    </div>
                    <div style={{ backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '8px' }}>
                      <p style={{ fontSize: '12px', color: '#666', margin: '0 0 0.5rem 0' }}>Resolution</p>
                      <p style={{ fontWeight: 'bold', color: 'black', margin: 0, fontSize: '16px' }}>{videoData.dimensions.width}x{videoData.dimensions.height}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '1.5rem', color: 'black' }}>Select Quality & Format</h3>
                
                {videoData.availableFormats?.video && videoData.availableFormats.video.length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '600', color: 'black', fontSize: '15px' }}>Video Quality</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
                      {videoData.availableFormats.video.map((fmt) => (
                        <button
                          key={fmt.quality}
                          onClick={() => handleStartDownload('video', fmt.quality, fmt.format)}
                          style={{
                            padding: '12px',
                            backgroundColor: '#7c3aed',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#6d28d9'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#7c3aed'}
                        >
                          {fmt.quality}
                          <br/>
                          <span style={{ fontSize: '12px', opacity: 0.9 }}>({fmt.fileSizeFormatted || 'N/A'})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {videoData.availableFormats?.audio && videoData.availableFormats.audio.length > 0 && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '600', color: 'black', fontSize: '15px' }}>Audio Only</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
                      {videoData.availableFormats.audio.map((fmt) => (
                        <button
                          key={fmt.quality}
                          onClick={() => handleStartDownload('audio', fmt.quality, fmt.format)}
                          style={{
                            padding: '12px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                        >
                          {fmt.quality}
                          <br/>
                          <span style={{ fontSize: '12px', opacity: 0.9 }}>({fmt.fileSizeFormatted || 'N/A'})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DOWNLOADING STEP */}
          {step === 'downloading' && (
            <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '2rem', color: 'black' }}>⬇️ Downloading...</h2>
              <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{
                  backgroundColor: '#e5e7eb',
                  borderRadius: '9999px',
                  height: '24px',
                  marginBottom: '1.5rem',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    backgroundColor: '#7c3aed',
                    height: '100%',
                    width: `${downloadProgress}%`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'black', margin: 0 }}>
                  {Math.round(downloadProgress)}%
                </p>
              </div>
            </div>
          )}

          {/* SUCCESS STEP */}
          {step === 'success' && (
            <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: '36px', marginBottom: '1rem', margin: 0 }}>✅ Success!</h2>
                <p style={{ color: '#666', marginBottom: '2rem', fontSize: '16px', margin: '1rem 0 2rem 0' }}>
                  Your video is ready to download!
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <button
                    onClick={downloadFile}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '15px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                  >
                    ⬇️ Download File
                  </button>
                  <button
                    onClick={() => {
                      setStep('input');
                      setUrl('');
                      setVideoData(null);
                      setJobId(null);
                      setDownloadProgress(0);
                    }}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '15px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#6d28d9'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#7c3aed'}
                  >
                    📥 Download Another
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#1f2937', color: '#9ca3af', padding: '2rem 1rem', textAlign: 'center', borderTop: '1px solid #374151' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>© 2025 VidVault. All rights reserved. | Supports 1000+ platforms</p>
        </div>
      </footer>
    </div>
  );
}
