import { useState } from 'react';
import { videoService } from './services/api.js';
import logoImage from '../logo.png';
import './App.css';

export default function App() {
  const [step, setStep] = useState('input');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoData, setVideoData] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleGetInfo = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a video URL');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await videoService.getVideoInfo(url);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch video info');
      }

      setVideoData(response.data.data);
      setStep('preview');
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch video information');
    } finally {
      setLoading(false);
    }
  };

  const startProgressPolling = (jobIdToTrack) => {
    return new Promise((resolve, reject) => {
      let isComplete = false;
      
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/download/progress/${jobIdToTrack}`);
          
          if (!response.ok) return;

          const data = await response.json();
          
          if (data.success && data.data) {
            const progress = Math.max(data.data.progress || 0, downloadProgress);
            setDownloadProgress(progress);

            if (data.data.status === 'completed' && !isComplete) {
              isComplete = true;
              setDownloadProgress(100);
              clearInterval(pollInterval);
              setTimeout(() => resolve('completed'), 500);
            } else if (data.data.status === 'failed' && !isComplete) {
              isComplete = true;
              clearInterval(pollInterval);
              reject(new Error(data.data.error || 'Download failed'));
            }
          }
        } catch (err) {
          console.error('Error polling:', err);
        }
      }, 200);
      
      setTimeout(() => {
        if (!isComplete) {
          clearInterval(pollInterval);
          reject(new Error('Download timeout'));
        }
      }, 1800000);
    });
  };

  const handleStartDownload = async (type, quality, format) => {
    setError('');
    setLoading(true);
    setDownloadProgress(0);
    setStep('downloading');

    try {
      const response = await fetch('http://localhost:5000/api/download/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, type, quality, format })
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const jobIdFromHeader = response.headers.get('X-Job-Id');
      const contentDispositionHeader = response.headers.get('content-disposition');
      
      let filename = 'download';
      if (contentDispositionHeader) {
        const filenameMatch = contentDispositionHeader.match(/filename="?([^"]+)"?/);
        filename = filenameMatch ? filenameMatch[1] : filename;
      }

      // Start progress polling
      let isComplete = false;
      const pollInterval = setInterval(async () => {
        try {
          const progressResponse = await fetch(`http://localhost:5000/api/download/progress/${jobIdFromHeader}`);
          if (progressResponse.ok) {
            const data = await progressResponse.json();
            if (data.success && data.data) {
              const newProgress = data.data.progress || 0;
              setDownloadProgress(newProgress);
              
              if (data.data.status === 'completed' || newProgress >= 100) {
                isComplete = true;
              }
            }
          }
        } catch (pollErr) {
          console.error('Poll error:', pollErr);
        }
      }, 200);

      // Fallback progress simulator if polling doesn't work
      let simulatedProgress = 5;
      const simulateInterval = setInterval(() => {
        if (!isComplete && simulatedProgress < 95) {
          simulatedProgress += Math.random() * 15;
          if (simulatedProgress > 95) simulatedProgress = 95;
          setDownloadProgress(Math.round(simulatedProgress));
        }
      }, 500);

      // Read blob and trigger download
      const blob = await response.blob();
      
      // Set progress to near complete
      setDownloadProgress(98);

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Give it a moment and then complete
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      clearInterval(pollInterval);
      clearInterval(simulateInterval);
      setDownloadProgress(100);
      isComplete = true;

      await new Promise(resolve => setTimeout(resolve, 500));

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        window.URL.revokeObjectURL(downloadUrl);
      }, 500);

      setStep('success');
      setLoading(false);
        
    } catch (err) {
      console.error('❌ Download error:', err);
      const errorMsg = err.message || 'Failed to download file';
      setError(errorMsg);
      setStep('preview');
      setLoading(false);
    }
  };

  const handlePaste = async (e) => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const features = [
    { icon: '⚡', name: 'Lightning Fast', desc: 'Direct streaming downloads' },
    { icon: '4️⃣', name: '4K Quality', desc: 'Up to 2160p resolution' },
    { icon: '🌍', name: '1000+ Sites', desc: 'YouTube, Instagram, TikTok & more' },
    { icon: '🎵', name: 'Audio Extract', desc: 'Convert videos to MP3' },
    { icon: '🔒', name: 'Secure', desc: '100% private, no tracking' },
    { icon: '💰', name: 'Free Forever', desc: 'No credit card required' }
  ];

  const platforms = [
    { icon: '▶️', name: 'YouTube' },
    { icon: '📷', name: 'Instagram' },
    { icon: '🎵', name: 'TikTok' },
    { icon: '𝕏', name: 'Twitter' },
    { icon: '👥', name: 'Facebook' },
    { icon: '🎬', name: 'Vimeo' },
    { icon: '📹', name: 'Reddit' },
    { icon: '⚙️', name: '...1000+' }
  ];

  return (
    <div className="app-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo-section">
          <div className="logo-icon">
            <img src={logoImage} alt="VidVault Logo" />
          </div>
          <div className="brand-text">VidVault</div>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#platforms">Platforms</a>
          <a href="#about">About</a>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* INPUT STEP */}
        {step === 'input' && (
          <div className="hero-section">
            {/* Input Form - TOP FOR MOBILE */}
            <form onSubmit={handleGetInfo} className="input-section input-section--top">
              <div className="input-wrapper">
                <input 
                  type="text" 
                  placeholder="Paste video URL here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onPaste={handlePaste}
                  className="input-field"
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className={`submit-btn ${loading ? 'loading' : ''}`}
                >
                  {loading ? '⏳ Fetching...' : '📥 Get Video Info'}
                </button>
              </div>
            </form>

            {/* Error Message */}
            {error && (
              <div className="alert alert--error">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <h1 className="hero-title">Download Videos & Audio</h1>
            <p className="hero-subtitle">
              Get videos from 1000+ platforms in seconds. No sign-up needed. Always free.
            </p>

            {/* Feature Cards */}
            <div className="feature-grid">
              {features.slice(0, 3).map((feature, idx) => (
                <div key={idx} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <div className="feature-name">{feature.name}</div>
                  <div className="feature-desc">{feature.desc}</div>
                </div>
              ))}
            </div>

            {/* Platforms Section */}
            <div id="platforms" className="section-padding">
              <h2 className="section-title">
                ✨ Supported Platforms
              </h2>
              <div className="platforms-grid">
                {platforms.map((platform, idx) => (
                  <div 
                    key={idx}
                    className="feature-card feature-card--center"
                  >
                    <div className="feature-icon">{platform.icon}</div>
                    <div className="feature-name feature-name--small">{platform.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Features */}
            <div id="features" style={{ marginTop: '80px' }}>
              <h2 className="section-title">
                🚀 Why Choose VidVault?
              </h2>
              <div className="feature-grid feature-grid--full">
                {features.map((feature, idx) => (
                  <div key={idx} className="feature-card feature-card--center">
                    <div className="feature-name">{feature.name}</div>
                    <div className="feature-desc">{feature.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PREVIEW STEP */}
        {step === 'preview' && videoData && (
          <div className="preview-container">
            <button 
              onClick={() => { setStep('input'); setUrl(''); setError(''); }}
              className="btn btn-back"
            >
              ← Back to Input
            </button>
            
            <div className="video-card">
              {/* Thumbnail */}
              <div className="video-thumbnail">
                <img 
                  src={videoData.thumbnail}
                  alt={videoData.title}
                />
                <div className="play-button">▶️</div>
              </div>

              {/* Video Info */}
              <div className="video-info">
                <h2 className="video-title">{videoData.title}</h2>
                
                <div className="video-meta">
                  <div className="meta-item">
                    <span>⏱️</span>
                    <strong>{videoData.durationFormatted}</strong>
                  </div>
                  <div className="meta-item">
                    <span>📊</span>
                    <strong>{videoData.viewCount?.toLocaleString() || 'N/A'} views</strong>
                  </div>
                  <div className="meta-item">
                    <span>👤</span>
                    <strong>{videoData.uploader}</strong>
                  </div>
                  <div className="meta-item">
                    <span>📺</span>
                    <strong>{videoData.width}x{videoData.height}</strong>
                  </div>
                </div>

                {videoData.description && (
                  <div className="video-description">
                    {videoData.description}
                  </div>
                )}

                {error && (
                  <div className="alert error" style={{ marginBottom: '20px' }}>
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Quality Selector */}
                {videoData.availableFormats && (
                  <>
                    {/* Video Formats */}
                    {videoData.availableFormats.video && videoData.availableFormats.video.length > 0 && (
                      <div className="quality-section">
                        <div className="quality-header">📹 Video Quality</div>
                        <div className="quality-buttons">
                          {videoData.availableFormats.video.map((fmt) => (
                            <button
                              key={fmt.quality + fmt.format}
                              onClick={() => handleStartDownload('video', fmt.quality, fmt.format)}
                              disabled={loading}
                              className={`quality-btn ${loading ? 'loading' : ''}`}
                            >
                              {fmt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Audio Formats */}
                    {videoData.availableFormats.audio && videoData.availableFormats.audio.length > 0 && (
                      <div className="quality-section">
                        <div className="quality-header">🎵 Audio Only</div>
                        <div className="quality-buttons">
                          {videoData.availableFormats.audio.map((fmt) => (
                            <button
                              key={fmt.quality + fmt.format}
                              onClick={() => handleStartDownload('audio', fmt.quality, fmt.format)}
                              disabled={loading}
                              className={`quality-btn ${loading ? 'loading' : ''}`}
                            >
                              {fmt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DOWNLOADING STEP */}
        {step === 'downloading' && (
          <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center', marginTop: '60px' }}>
            <div style={{ fontSize: '80px', marginBottom: '30px', animation: 'bounce 1s infinite' }}>
              ⬇️
            </div>
            <h2 className="hero-title" style={{ marginBottom: '40px' }}>Downloading...</h2>
            <div className="progress-container">
              <div className="progress-label">
                <span>Download Progress</span>
                <span className="progress-percentage">{Math.round(downloadProgress)}%</span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
              <div className="progress-status">
                {downloadProgress < 25 ? 'Preparing...' :
                 downloadProgress < 50 ? 'Downloading...' :
                 downloadProgress < 75 ? 'Almost there...' :
                 downloadProgress < 100 ? 'Finalizing...' : 'Complete!'}
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS STEP */}
        {step === 'success' && (
          <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
            <div className="video-card">
              <div className="video-info" style={{ textAlign: 'center', paddingTop: '40px' }}>
                <div style={{ fontSize: '80px', marginBottom: '20px', animation: 'bounce 0.6s ease' }}>
                  ✅
                </div>
                <h2 className="video-title" style={{ color: 'var(--success)', marginBottom: '15px' }}>
                  Download Complete!
                </h2>
                <p className="video-description" style={{ maxHeight: 'none', marginBottom: '30px' }}>
                  Your file has been saved to your Downloads folder.
                </p>
                <div className="button-group">
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setStep('input');
                      setUrl('');
                      setVideoData(null);
                      setDownloadProgress(0);
                      setLoading(false);
                      setError('');
                    }}
                  >
                    📥 Download Another
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-text">
          © 2025 VidVault. Download videos from 1000+ platforms instantly.
        </div>
        <div className="footer-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#contact">Contact</a>
        </div>
      </footer>
    </div>
  );
}
