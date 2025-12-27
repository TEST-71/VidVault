import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { createRateLimiter } from './middleware.js';
import { getVideoInfo, downloadVideo } from './ytdlpHelper.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    process.env.FRONTEND_URL || 'http://localhost:3002'
  ],
  credentials: true,
}));
app.use(express.json());

// Rate limiting - more lenient for progress checks
const limiter = createRateLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000,
  max: parseInt(process.env.RATE_LIMIT_REQUESTS) || 100,
});

app.use(limiter);

// Create temp directory if it doesn't exist
const tempDir = process.env.TEMP_DOWNLOAD_PATH || './temp';
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Mock storage for active downloads
const activeDownloads = new Map();

// ==================== API Routes ====================

// Thumbnail proxy endpoint
app.get('/api/thumbnail', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter required' });
    }

    // Decode the URL
    const decodedUrl = decodeURIComponent(url);
    
    // Fetch the image with proper headers to bypass restrictions
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    try {
      const response = await fetch(decodedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.instagram.com/',
          'Accept': 'image/*',
        },
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Failed to fetch thumbnail: ${response.status}`);
      }

      // Forward the image with proper headers
      const contentType = response.headers.get('content-type');
      res.set('Content-Type', contentType || 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=3600');
      res.set('Access-Control-Allow-Origin', '*');
      
      // Use arrayBuffer() instead of buffer()
      const buffer = Buffer.from(await response.arrayBuffer());
      res.send(buffer);
    } catch (fetchError) {
      clearTimeout(timeout);
      if (fetchError.name === 'AbortError') {
        throw new Error('Thumbnail fetch timeout');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error fetching thumbnail:', error.message);
    res.status(500).json({ error: 'Failed to fetch thumbnail' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'VidVault Backend is running' });
});

// Get supported platforms
app.get('/api/platforms', (req, res) => {
  res.json({
    success: true,
    data: {
      platforms: [
        { id: 'youtube', name: 'YouTube', icon: '▶️' },
        { id: 'instagram', name: 'Instagram', icon: '📷' },
        { id: 'tiktok', name: 'TikTok', icon: '🎵' },
        { id: 'facebook', name: 'Facebook', icon: '👍' },
        { id: 'twitter', name: 'Twitter/X', icon: '𝕏' },
        { id: 'vimeo', name: 'Vimeo', icon: '▶️' },
        { id: 'dailymotion', name: 'Dailymotion', icon: '▶️' },
      ]
    }
  });
});

// Validate URL
app.post('/api/validate-url', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'URL is required'
    });
  }

  try {
    new URL(url);
    
    // Determine platform
    let platform = 'unknown';
    if (url.includes('youtube.com') || url.includes('youtu.be')) platform = 'youtube';
    else if (url.includes('instagram.com')) platform = 'instagram';
    else if (url.includes('tiktok.com')) platform = 'tiktok';
    else if (url.includes('facebook.com')) platform = 'facebook';
    else if (url.includes('twitter.com') || url.includes('x.com')) platform = 'twitter';
    else if (url.includes('vimeo.com')) platform = 'vimeo';
    else if (url.includes('dailymotion.com')) platform = 'dailymotion';

    res.json({
      success: true,
      data: {
        valid: true,
        platform,
        url
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Invalid URL format'
    });
  }
});

// Get video info (Real implementation with yt-dlp)
app.post('/api/video/info', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'URL is required'
    });
  }

  try {
    console.log('Fetching video info for:', url);
    
    const videoInfo = await getVideoInfo(url);
    
    res.json({
      success: true,
      data: {
        ...videoInfo,
        id: videoInfo.id || uuidv4(),
        creator: {
          username: videoInfo.uploader || 'Unknown',
          displayName: videoInfo.uploader || 'Unknown',
          profilePicture: 'https://via.placeholder.com/48x48?text=Profile',
        },
        stats: {
          viewsFormatted: formatCount(videoInfo.viewCount),
          likesFormatted: formatCount(videoInfo.likeCount),
          views: videoInfo.viewCount,
          likes: videoInfo.likeCount
        },
        dimensions: {
          width: videoInfo.width || 1920,
          height: videoInfo.height || 1080
        },
        uploadDateRelative: 'Recently',
        availableFormats: videoInfo.availableFormats || { video: [], audio: [] }
      }
    });
  } catch (error) {
    console.error('Error fetching video info:', error.message);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to fetch video information'
    });
  }
});

// Initiate download
app.post('/api/download', async (req, res) => {
  const { url, type, quality, format } = req.body;

  if (!url || !type || !quality || !format) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters: url, type, quality, format'
    });
  }

  try {
    const jobId = uuidv4();
    const timestamp = Date.now();

    // Store download job
    activeDownloads.set(jobId, {
      status: 'processing',
      progress: 0,
      url,
      type,
      quality,
      format,
      startTime: timestamp,
      filePath: null
    });

    // Start download asynchronously (don't wait for completion)
    (async () => {
      try {
        const outputPath = join(tempDir, jobId);
        if (!fs.existsSync(outputPath)) {
          fs.mkdirSync(outputPath, { recursive: true });
        }

        // Callback function to update progress
        const onProgress = (progress) => {
          if (activeDownloads.has(jobId)) {
            const download = activeDownloads.get(jobId);
            download.progress = progress;
          }
        };

        const filePath = await downloadVideo(url, quality, format, outputPath, onProgress);
        
        if (activeDownloads.has(jobId)) {
          const download = activeDownloads.get(jobId);
          download.status = 'completed';
          download.progress = 100;
          download.filePath = filePath;
          console.log(`Download completed: ${jobId} -> ${filePath}`);
        }
      } catch (error) {
        console.error(`Download failed for job ${jobId}:`, error);
        if (activeDownloads.has(jobId)) {
          const download = activeDownloads.get(jobId);
          download.status = 'failed';
          download.error = error.message;
        }
      }
    })();

    res.json({
      success: true,
      data: {
        jobId,
        status: 'processing',
        message: 'Download initiated. Use the jobId to check progress.'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to initiate download: ' + error.message
    });
  }
});

// Get download progress
app.get('/api/download/progress/:jobId', (req, res) => {
  const { jobId } = req.params;

  if (!activeDownloads.has(jobId)) {
    return res.status(404).json({
      success: false,
      error: 'Download job not found'
    });
  }

  const download = activeDownloads.get(jobId);

  res.json({
    success: true,
    data: {
      jobId,
      status: download.status,
      progress: download.progress,
      downloadSpeed: '2.5 MB/s',
      eta: Math.max(0, 10 - Math.floor((Date.now() - download.startTime) / 1000)),
      error: download.error || null
    }
  });
});

// Download file
app.get('/api/download/file/:jobId', (req, res) => {
  const { jobId } = req.params;

  if (!activeDownloads.has(jobId)) {
    return res.status(404).json({
      success: false,
      error: 'Download job not found'
    });
  }

  const download = activeDownloads.get(jobId);

  if (download.status !== 'completed') {
    return res.status(400).json({
      success: false,
      error: `Download is ${download.status}. Cannot retrieve file.`
    });
  }

  if (!download.filePath || !fs.existsSync(download.filePath)) {
    return res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }

  res.download(download.filePath, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
    } else {
      // Clean up after download
      setTimeout(() => {
        if (fs.existsSync(download.filePath)) {
          try {
            const dir = dirname(download.filePath);
            fs.rmSync(dir, { recursive: true, force: true });
            activeDownloads.delete(jobId);
            console.log(`Cleaned up download: ${jobId}`);
          } catch (error) {
            console.error('Error cleaning up:', error);
          }
        }
      }, 1000);
    }
  });
});

// ==================== Error Handling ====================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// ==================== Helper Functions ====================

function formatCount(count) {
  if (!count) return '0';
  if (count >= 1000000) return Math.round(count / 1000000) + 'M';
  if (count >= 1000) return Math.round(count / 1000) + 'K';
  return count.toString();
}

// ==================== 404 Handler ====================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// ==================== Start Server ====================

app.listen(PORT, () => {
  console.log(`🚀 VidVault Backend running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
