import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * Get video information using yt-dlp
 * @param {string} url - Video URL
 * @returns {Promise<object>} Video information
 */
export async function getVideoInfo(url) {
  return new Promise((resolve, reject) => {
    const ytDlpProcess = spawn('python', [
      '-m', 'yt_dlp',
      '--dump-json',
      '--no-warnings',
      '--socket-timeout', '30',
      url
    ]);

    let stdout = '';
    let stderr = '';
    let finished = false;

    const timeout = setTimeout(() => {
      if (!finished) {
        finished = true;
        ytDlpProcess.kill();
        reject(new Error('yt-dlp timeout: took too long to fetch video info'));
      }
    }, 60000); // 60 second timeout

    ytDlpProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ytDlpProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ytDlpProcess.on('error', (err) => {
      if (!finished) {
        finished = true;
        clearTimeout(timeout);
        reject(new Error('Failed to spawn yt-dlp: ' + err.message));
      }
    });

    ytDlpProcess.on('close', (code) => {
      if (!finished) {
        finished = true;
        clearTimeout(timeout);
        
        if (code !== 0) {
          console.error('yt-dlp error:', stderr);
          reject(new Error('Failed to fetch video info: ' + stderr));
          return;
        }

        try {
          const data = JSON.parse(stdout);
          
          // Extract key information
          const videoInfo = {
            id: data.id || 'unknown',
            platform: getPlatformFromUrl(url),
            type: data._type || 'video',
            title: data.title || 'Untitled',
            description: data.description || '',
            thumbnail: data.thumbnail || '',
            duration: data.duration || 0,
            durationFormatted: formatDuration(data.duration || 0),
            uploader: data.uploader || data.channel || 'Unknown',
            uploadDate: data.upload_date || new Date().toISOString(),
            viewCount: data.view_count || 0,
            likeCount: data.like_count || 0,
            width: data.width || 1920,
            height: data.height || 1080,
            originalUrl: url,
            availableFormats: {
              video: extractVideoFormats(data.formats || []),
              audio: extractAudioFormats(data.formats || [])
            }
          };

          resolve(videoInfo);
        } catch (error) {
          reject(new Error('Failed to parse video info: ' + error.message));
        }
      }
    });
  });
}

/**
 * Download video using yt-dlp
 * @param {string} url - Video URL
 * @param {string} quality - Video quality (1080p, 720p, etc)
 * @param {string} format - File format (mp4, mp3, etc)
 * @param {string} outputPath - Directory to save file
 * @returns {Promise<string>} Downloaded file path
 */
export async function downloadVideo(url, quality, format, outputPath) {
  return new Promise((resolve, reject) => {
    const outputTemplate = path.join(outputPath, '%(title)s.%(ext)s');
    
    // Build yt-dlp arguments
    const args = [
      '--socket-timeout', '30',
      '-f', buildFormatString(quality, format),
      '-o', outputTemplate,
      '--no-warnings',
      '--merge-output-format', 'mp4'
    ];

    // For audio only
    if (format === 'mp3' || format === 'm4a' || format === 'wav') {
      args.push('-x');
      args.push('--audio-format', format);
      args.push('--audio-quality', buildAudioQuality(quality));
    }

    args.push(url);

    console.log('Starting download with args:', args);

    const ytDlpProcess = spawn('python', ['-m', 'yt_dlp', ...args]);
    let stderr = '';
    let finished = false;

    const timeout = setTimeout(() => {
      if (!finished) {
        finished = true;
        ytDlpProcess.kill();
        reject(new Error('Download timeout'));
      }
    }, 600000); // 10 minute timeout

    ytDlpProcess.stdout.on('data', (data) => {
      console.log('Download progress:', data.toString());
    });

    ytDlpProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      console.log('stderr:', data.toString());
    });

    ytDlpProcess.on('error', (err) => {
      if (!finished) {
        finished = true;
        clearTimeout(timeout);
        reject(new Error('Failed to spawn yt-dlp: ' + err.message));
      }
    });

    ytDlpProcess.on('close', (code) => {
      if (!finished) {
        finished = true;
        clearTimeout(timeout);

        if (code !== 0) {
          console.error('Download error:', stderr);
          reject(new Error('Download failed: ' + stderr));
          return;
        }

        // Find the downloaded file
        try {
          const files = fs.readdirSync(outputPath);
          if (files.length === 0) {
            reject(new Error('No files were downloaded'));
            return;
          }
          const downloadedFile = files[files.length - 1]; // Get the most recent file
          const filePath = path.join(outputPath, downloadedFile);
          
          if (!fs.existsSync(filePath)) {
            reject(new Error('Downloaded file does not exist'));
            return;
          }
          
          console.log('Download complete:', filePath);
          resolve(filePath);
        } catch (error) {
          reject(new Error('Failed to locate downloaded file: ' + error.message));
        }
      }
    });
  });
}

/**
 * Helper: Get platform from URL
 */
function getPlatformFromUrl(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('facebook.com')) return 'facebook';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
  if (url.includes('vimeo.com')) return 'vimeo';
  return 'unknown';
}

/**
 * Helper: Format duration in seconds to MM:SS
 */
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * Helper: Extract video formats from yt-dlp formats list
 */
function extractVideoFormats(formats) {
  const videoFormats = formats.filter(f => 
    f.vcodec && f.vcodec !== 'none' && 
    (f.ext === 'mp4' || f.ext === 'mkv' || f.ext === 'webm')
  );

  const uniqueQualities = new Map();

  videoFormats.forEach(f => {
    if (f.height) {
      const quality = f.height + 'p';
      if (!uniqueQualities.has(quality)) {
        // Calculate combined size (video + audio)
        // Get best audio for this quality
        const audioFormats = formats.filter(af => 
          af.acodec && af.acodec !== 'none' && !af.vcodec
        );
        const bestAudio = audioFormats.length > 0 ? audioFormats[0] : null;
        const combinedSize = (f.filesize || 0) + (bestAudio?.filesize || 0);
        
        uniqueQualities.set(quality, {
          quality,
          format: f.ext || 'mp4',
          fileSize: combinedSize,
          fileSizeFormatted: formatFileSize(combinedSize),
          formatId: f.format_id
        });
      }
    }
  });

  // Return sorted by quality (highest first)
  return Array.from(uniqueQualities.values())
    .sort((a, b) => {
      return parseInt(b.quality) - parseInt(a.quality);
    })
    .slice(0, 5); // Return top 5 qualities
}

/**
 * Helper: Extract audio formats from yt-dlp formats list
 */
function extractAudioFormats(formats) {
  const audioFormats = formats.filter(f => 
    f.acodec && f.acodec !== 'none' && !f.vcodec
  );
  
  if (audioFormats.length === 0) {
    return [{
      quality: 'best',
      format: 'mp3',
      fileSize: 0,
      fileSizeFormatted: 'Unknown'
    }];
  }

  // Find best audio quality
  const bestAudio = audioFormats.reduce((best, current) => {
    const currentAbr = current.abr || 0;
    const bestAbr = best.abr || 0;
    return currentAbr > bestAbr ? current : best;
  });

  return [
    {
      quality: 'high (320kbps)',
      format: 'mp3',
      fileSize: bestAudio.filesize || 0,
      fileSizeFormatted: formatFileSize(bestAudio.filesize || 0)
    },
    {
      quality: 'medium (192kbps)',
      format: 'mp3',
      fileSize: bestAudio.filesize ? Math.floor(bestAudio.filesize * 0.6) : 0,
      fileSizeFormatted: formatFileSize(bestAudio.filesize ? Math.floor(bestAudio.filesize * 0.6) : 0)
    }
  ];
}

/**
 * Helper: Format file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Helper: Build format string for yt-dlp
 */
function buildFormatString(quality, format) {
  if (format === 'mp3' || format === 'wav' || format === 'm4a' || format === 'opus') {
    return 'bestaudio';
  }

  // Map quality to yt-dlp format - includes BOTH video and audio
  switch (quality) {
    case '2160p':
      return 'best[height<=2160][ext=mp4]+bestaudio[ext=m4a]/best[height<=2160][ext=mp4]+bestaudio/best[ext=mp4]';
    case '1440p':
      return 'best[height<=1440][ext=mp4]+bestaudio[ext=m4a]/best[height<=1440][ext=mp4]+bestaudio/best[ext=mp4]';
    case '1080p':
      return 'best[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]+bestaudio/best[ext=mp4]';
    case '720p':
      return 'best[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]+bestaudio/best[ext=mp4]';
    case '480p':
      return 'best[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]+bestaudio/best[ext=mp4]';
    case '360p':
      return 'best[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360][ext=mp4]+bestaudio/best[ext=mp4]';
    case '240p':
      return 'best[height<=240][ext=mp4]+bestaudio[ext=m4a]/best[height<=240][ext=mp4]+bestaudio/best[ext=mp4]';
    default:
      return 'best[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]+bestaudio/best[ext=mp4]';
  }
}

/**
 * Helper: Build audio quality for yt-dlp
 */
function buildAudioQuality(quality) {
  if (quality.includes('320')) return '192';
  if (quality.includes('256')) return '192';
  if (quality.includes('192')) return '128';
  if (quality.includes('128')) return '128';
  if (quality.includes('96')) return '96';
  if (quality.includes('64')) return '64';
  return '192'; // default
}
