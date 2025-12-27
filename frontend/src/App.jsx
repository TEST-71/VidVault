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

  // Poll progress while downloading
  useEffect(() => {
    if (step === 'downloading' && jobId) {
      const pollProgress = async () => {
        try {
          const response = await videoService.getDownloadProgress(jobId);
          const { data } = response.data;
          
          setDownloadProgress(Math.min(data.progress, 99)); // Cap at 99% until completion
          
          if (data.status === 'completed') {
            setDownloadProgress(100);
            setTimeout(() => {
              setStep('success');
            }, 500);
          } else if (data.status === 'failed') {
            setError('Download failed: ' + (data.error || 'Unknown error'));
            setStep('preview');
          }
        } catch (err) {
          console.error('Error checking progress:', err);
        }
      };

      // Poll every 500ms for smooth animation
      const interval = setInterval(pollProgress, 500);
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
    setDownloadProgress(0);
    setStep('downloading');

    try {
      // Use direct download endpoint - streams directly to client
      const response = await videoService.directDownload(url, type, quality, format);
      
      // Extract jobId from response headers for progress tracking
      const jobIdFromHeader = response.headers['x-job-id'];
      if (jobIdFromHeader) {
        setJobId(jobIdFromHeader);
      }
      
      if (!response.data || response.data.length === 0) {
        throw new Error('Download returned empty file');
      }
      
      // Create a blob from the response and trigger download
      const blob = new Blob([response.data], { 
        type: type === 'audio' ? 'audio/mpeg' : 'video/mp4' 
      });
      
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }
      
      // Extract filename from content-disposition header or create one
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'download.mp4';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      } else {
        const ext = type === 'audio' ? format : 'mp4';
        filename = `${videoData?.title || 'download'}.${ext}`;
      }
      
      // Create download link and trigger
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup after download is triggered
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }, 500);
      
      // Progress polling will take over from here via useEffect
      
    } catch (err) {
      console.error('Download error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Failed to download file';
      setError(errorMsg);
      setStep('preview');
      setJobId(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
      {/* HEADER */}
      <header style={{ 
        background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f97316 100%)',
        color: 'white',
        padding: '2rem 1rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '36px', fontWeight: 'bold' }}>📥 VidVault</h1>
          <p style={{ margin: 0, fontSize: '16px', opacity: 0.95 }}>Download Videos & Audio from 1000+ Platforms</p>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '0 1rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 0' }}>
          {/* INPUT STEP */}
          {step === 'input' && (
            <>
              <div style={{ maxWidth: '600px', margin: '0 auto', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: 'black', marginBottom: '1.5rem', textAlign: 'center' }}>
                  Download Videos & Audio
                </h2>
                
                <form onSubmit={handleDownload} style={{ marginBottom: '2rem' }}>
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    backgroundColor: 'white',
                    padding: '8px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    marginBottom: '2rem'
                  }}>
                    <input 
                      type="text" 
                      placeholder="Paste video URL here..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: 'none',
                        fontSize: '16px',
                        fontFamily: 'inherit',
                        outline: 'none'
                      }}
                    />
                    <button 
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '16px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'transform 0.2s',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseOver={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
                      onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                      {loading ? '⏳ Processing...' : '⬇️ Download'}
                    </button>
                  </div>
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

              {/* SUPPORTED PLATFORMS SECTION */}
              <div style={{ marginTop: '4rem' }}>
                <h2 style={{ textAlign: 'center', fontSize: '28px', fontWeight: 'bold', color: 'black', marginBottom: '1.5rem' }}>
                  Supported Platforms
                </h2>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
                  gap: '1.5rem',
                  maxWidth: '900px',
                  margin: '0 auto',
                  padding: '2rem',
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  {[
                    { icon: '▶️', name: 'YouTube', color: '#FF0000' },
                    { icon: '📷', name: 'Instagram', color: '#E4405F' },
                    { icon: '🎵', name: 'TikTok', color: '#000000' },
                    { icon: '𝕏', name: 'X/Twitter', color: '#000000' },
                    { icon: '👥', name: 'Facebook', color: '#1877F2' },
                    { icon: '▶️', name: 'Vimeo', color: '#1AB7EA' },
                    { icon: '📹', name: 'Reddit', color: '#FF4500' },
                    { icon: '🎬', name: '1000+ More', color: '#7c3aed' }
                  ].map((platform) => (
                    <div
                      key={platform.name}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        backgroundColor: '#f9fafb',
                        border: '2px solid #f0f0f0',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textDecoration: 'none'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = platform.color;
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = `0 4px 12px ${platform.color}40`;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.borderColor = '#f0f0f0';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ fontSize: '32px', marginBottom: '0.5rem' }}>{platform.icon}</div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: 'black' }}>{platform.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FEATURES SECTION */}
              <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '4rem auto 0 auto' }}>
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center', border: '2px solid #f0f0f0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '1rem' }}>⚡</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '0.75rem', color: 'black' }}>Lightning Fast</h3>
                  <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Direct streaming - no server storage, instant downloads</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center', border: '2px solid #f0f0f0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🎯</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '0.75rem', color: 'black' }}>High Quality</h3>
                  <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Choose from 240p up to 4K resolution options</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center', border: '2px solid #f0f0f0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🎬</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '0.75rem', color: 'black' }}>Multiple Formats</h3>
                  <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>MP4, WebM, MP3, WAV, M4A, OPUS & more</p>
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
                  color: '#374151',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#e5e7eb';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                }}
              >
                ← Back
              </button>
              
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '16px', 
                overflow: 'hidden', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                marginBottom: '2rem',
                border: '1px solid #f0f0f0'
              }}>
                {videoData.thumbnail && (
                  <img 
                    src={videoData.thumbnail}
                    alt={videoData.title}
                    style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '400px', objectFit: 'cover' }}
                    onError={(e) => {
                      // If direct URL fails, try proxy endpoint
                      if (!e.target.src.includes('api/thumbnail')) {
                        e.target.src = `http://localhost:5000/api/thumbnail?url=${encodeURIComponent(videoData.thumbnail)}`;
                      }
                    }}
                  />
                )}
                <div style={{ padding: '2rem' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '1rem', color: 'black' }}>
                    {videoData.title}
                  </h2>
                  <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '15px', lineHeight: '1.6' }}>
                    {videoData.description?.substring(0, 150)}...
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div style={{ 
                      backgroundColor: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                      padding: '1rem', 
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <p style={{ fontSize: '12px', color: '#666', margin: '0 0 0.5rem 0' }}>⏱️ Duration</p>
                      <p style={{ fontWeight: 'bold', color: 'black', margin: 0, fontSize: '16px' }}>{videoData.durationFormatted}</p>
                    </div>
                    <div style={{ 
                      backgroundColor: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                      padding: '1rem', 
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb'
                    }}>
                      <p style={{ fontSize: '12px', color: '#666', margin: '0 0 0.5rem 0' }}>📺 Resolution</p>
                      <p style={{ fontWeight: 'bold', color: 'black', margin: 0, fontSize: '16px' }}>{videoData.dimensions.width}x{videoData.dimensions.height}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '16px', 
                padding: '2rem', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0'
              }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '1.5rem', color: 'black' }}>Select Quality & Format</h3>
                
                {videoData.availableFormats?.video && videoData.availableFormats.video.length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '600', color: 'black', fontSize: '15px' }}>📹 Video Quality</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
                      {videoData.availableFormats.video.map((fmt) => (
                        <button
                          key={fmt.quality + fmt.format + fmt.fileSize}
                          onClick={() => handleStartDownload('video', fmt.quality, fmt.format)}
                          style={{
                            padding: '12px',
                            background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.4)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 8px rgba(124, 58, 237, 0.3)';
                          }}
                        >
                          {fmt.quality}
                          <span style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>({fmt.fileSizeFormatted || 'N/A'})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {videoData.availableFormats?.audio && videoData.availableFormats.audio.length > 0 && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '600', color: 'black', fontSize: '15px' }}>🔊 Audio Only</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
                      {videoData.availableFormats.audio.map((fmt) => (
                        <button
                          key={fmt.quality + fmt.format + fmt.fileSize}
                          onClick={() => handleStartDownload('audio', fmt.quality, fmt.format)}
                          style={{
                            padding: '12px',
                            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '14px',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                          }}
                        >
                          {fmt.quality}
                          <span style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>({fmt.fileSizeFormatted || 'N/A'})</span>
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
              <div style={{ 
                backgroundColor: 'white', 
                padding: '3rem', 
                borderRadius: '16px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0'
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 100%)',
                  borderRadius: '9999px',
                  height: '24px',
                  marginBottom: '1.5rem',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    background: 'linear-gradient(90deg, #7c3aed 0%, #ec4899 100%)',
                    height: '100%',
                    width: `${downloadProgress}%`,
                    transition: 'width 0.3s ease',
                    boxShadow: '0 0 10px rgba(124, 58, 237, 0.6)'
                  }} />
                </div>
                <p style={{ fontSize: '32px', fontWeight: 'bold', background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                  {Math.round(downloadProgress)}%
                </p>
              </div>
            </div>
          )}

          {/* SUCCESS STEP */}
          {step === 'success' && (
            <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '3rem', 
                borderRadius: '16px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid #f0f0f0',
                animation: 'slideUp 0.5s ease'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '1rem', animation: 'bounce 0.6s ease' }}>✅</div>
                <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '1rem', margin: 0, background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Download Complete!</h2>
                <p style={{ color: '#666', fontSize: '16px', margin: '1rem 0 2rem 0', lineHeight: '1.6' }}>
                  Your file has been saved to your Downloads folder. Ready to download more?
                </p>
                <button
                  onClick={() => {
                    setStep('input');
                    setUrl('');
                    setVideoData(null);
                    setDownloadProgress(0);
                  }}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    fontSize: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(124, 58, 237, 0.3)';
                  }}
                >
                  📥 Download Another
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ 
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        color: '#9ca3af', 
        padding: '2rem 1rem', 
        textAlign: 'center', 
        borderTop: '1px solid #374151',
        marginTop: '4rem'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 1rem 0', fontSize: '14px' }}>© 2025 VidVault. Download videos from 1000+ platforms instantly.</p>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>⚡ Fast • 🎯 High Quality • 🔒 Private • 💯 100% Free</p>
        </div>
      </footer>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}
