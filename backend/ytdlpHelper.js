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
            thumbnail: getThumbnail(data),
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
export async function downloadVideo(url, quality, format, outputPath, onProgress = null) {
  return new Promise((resolve, reject) => {
    const outputTemplate = path.join(outputPath, '%(title)s.%(ext)s');
    
    // Build yt-dlp arguments
    const args = [
      '--socket-timeout', '30',
      '-f', buildFormatString(quality, format),
      '-o', outputTemplate,
      '--no-warnings',
      '--merge-output-format', 'mp4',
      '--progress-template', '[download] %(progress._percent_str)s'
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
      const output = data.toString();
      console.log('Download progress:', output);
      
      // Parse progress percentage from yt-dlp output
      if (onProgress) {
        const progressMatch = output.match(/\[download\]\s+([\d.]+)%/);
        if (progressMatch) {
          const progress = Math.min(Math.round(parseFloat(progressMatch[1])), 99);
          onProgress(progress);
        }
      }
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
 * Helper: Get thumbnail from different sources
 */
function getThumbnail(data) {
  // Try primary thumbnail field
  if (data.thumbnail) return data.thumbnail;
  
  // Try thumbnails array (YouTube, etc)
  if (data.thumbnails && Array.isArray(data.thumbnails) && data.thumbnails.length > 0) {
    // Return the last/largest thumbnail
    return data.thumbnails[data.thumbnails.length - 1].url;
  }
  
  // Instagram: try alt_title for image URL or check ext_data
  if (data.ext && data.ext === 'instagram') {
    // Try original_url field for Instagram
    if (data.original_url) return data.original_url;
    // Try webpage_url_basename or other Instagram-specific fields
    if (data.display_url) return data.display_url;
  }
  
  // Try alternate thumbnail fields
  if (data.thumb) return data.thumb;
  
  // Try artwork array (Apple Music, etc)
  if (data.artwork && Array.isArray(data.artwork) && data.artwork.length > 0) {
    return data.artwork[0];
  }
  
  // Try image field (some platforms)
  if (data.image) return data.image;
  
  // Try images array
  if (data.images && Array.isArray(data.images) && data.images.length > 0) {
    return data.images[0];
  }
  
  // Try webpage_url as last resort (some platforms embed thumbnail in page)
  if (data.webpage_url) return data.webpage_url;
  
  return '';
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
  // Filter for video formats with actual codecs
  const videoFormats = formats.filter(f => 
    f.vcodec && f.vcodec !== 'none'
  );

  // Get best audio once (for size calculation)
  const audioFormats = formats.filter(af => 
    af.acodec && af.acodec !== 'none' && !af.vcodec
  );
  const bestAudio = audioFormats.length > 0 ? audioFormats[0] : null;
  const audioSize = bestAudio ? (bestAudio.filesize || bestAudio.filesize_approx || 0) : 0;

  // Show each unique quality/resolution only once (keep best version for each quality)
  const uniqueQualities = new Map();
  
  videoFormats.forEach(f => {
    // Use height as quality key if available, otherwise width or format_id
    let qualityKey;
    if (f.height && f.height > 0) {
      qualityKey = f.height + 'p';
    } else if (f.width && f.width > 0) {
      qualityKey = f.width + 'w';
    } else if (f.format_id) {
      qualityKey = f.format_id;
    } else {
      return; // Skip if no identifier
    }

    const videoSize = f.filesize || f.filesize_approx || 0;
    const combinedSize = videoSize + audioSize;
    
    // Keep this version if it's the first one or has larger file size
    if (!uniqueQualities.has(qualityKey) || combinedSize > uniqueQualities.get(qualityKey).fileSize) {
      uniqueQualities.set(qualityKey, {
        quality: qualityKey,
        format: f.ext || 'mp4',
        fileSize: combinedSize,
        fileSizeFormatted: formatFileSize(combinedSize),
        formatId: f.format_id
      });
    }
  });

  // Return sorted by quality (highest first for numeric qualities)
  return Array.from(uniqueQualities.values())
    .sort((a, b) => {
      const aNum = parseInt(a.quality);
      const bNum = parseInt(b.quality);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return bNum - aNum;
      }
      return 0;
    })
    .map(fmt => ({
      ...fmt,
      label: `${fmt.quality} (${fmt.fileSizeFormatted})`
    }));
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
      quality: 'Audio Only',
      format: 'mp3',
      fileSize: 0,
      fileSizeFormatted: 'Unknown',
      label: 'Audio Only'
    }];
  }

  // Sort by bitrate descending and show unique audio options
  const sorted = audioFormats.sort((a, b) => (b.abr || 0) - (a.abr || 0));
  
  // Show up to 2 unique audio options with their actual file sizes
  const audioOptions = [];
  const seenBitrates = new Set();
  
  sorted.forEach((af, idx) => {
    if (audioOptions.length >= 2) return;
    
    const abr = af.abr || Math.floor((af.filesize || af.filesize_approx || 0) / (af.duration || 1) / 128);
    const abrKey = Math.round(abr / 32) * 32; // Group similar bitrates
    
    if (!seenBitrates.has(abrKey)) {
      seenBitrates.add(abrKey);
      const fileSize = af.filesize || af.filesize_approx || 0;
      audioOptions.push({
        quality: 'Audio Only (' + (fileSize > 0 ? formatFileSize(fileSize) : 'Unknown') + ')',
        format: af.ext || 'mp3',
        fileSize: fileSize,
        fileSizeFormatted: formatFileSize(fileSize)
      });
    }
  });
  
  return audioOptions.length > 0 ? audioOptions.map(opt => ({
    ...opt,
    label: opt.quality
  })) : [{
    quality: 'Audio Only',
    format: 'mp3',
    fileSize: 0,
    fileSizeFormatted: 'Unknown',
    label: 'Audio Only'
  }];
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

  // Check if quality is a format_id (alphanumeric) or height-based (numeric with 'p')
  if (!quality.includes('p') && !quality.match(/^\d+$/)) {
    // It's likely a format_id, use it directly with audio
    return `${quality}+bestaudio/best[ext=mp4]`;
  }

  // Extract height from quality string (e.g., "1080p" -> 1080 or "1280p" -> 1280)
  const heightMatch = quality.match(/(\d+)p/);
  const height = heightMatch ? heightMatch[1] : '1080';

  // Use exact height match, with fallback to best available
  return `best[height=${height}][ext=mp4]+bestaudio[ext=m4a]/best[height=${height}][ext=mp4]+bestaudio/best[height<=${height}][ext=mp4]+bestaudio/best[ext=mp4]+bestaudio`;
}

/**
 * Download video directly to a writable stream (for client-side download)
 * @param {string} url - Video URL
 * @param {string} quality - Video quality
 * @param {string} format - File format
 * @param {Stream} outputStream - Writable stream to pipe to (e.g., res for HTTP response)
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<string>} Filename for Content-Disposition header
 */
export async function downloadVideoStream(url, quality, format, outputStream, onProgress = null) {
  return new Promise((resolve, reject) => {
    // Build yt-dlp arguments to output to stdout
    const args = [
      '--socket-timeout', '30',
      '-f', buildFormatString(quality, format),
      '-o', '-',  // Output to stdout
      '--no-warnings',
      '--merge-output-format', 'mp4',
      '--progress-template', '[download] %(progress._percent_str)s'
    ];

    // For audio only
    if (format === 'mp3' || format === 'm4a' || format === 'wav' || format === 'opus') {
      args.push('-x');
      args.push('--audio-format', format);
      args.push('--audio-quality', buildAudioQuality(quality));
    }

    args.push(url);

    console.log('Starting stream download for:', url);

    const ytDlpProcess = spawn('python', ['-m', 'yt_dlp', ...args]);
    let stderr = '';
    let finished = false;
    let filename = `download.${format}`;

    const timeout = setTimeout(() => {
      if (!finished) {
        finished = true;
        ytDlpProcess.kill();
        outputStream.destroy();
        reject(new Error('Download timeout'));
      }
    }, 600000); // 10 minute timeout

    // Pipe stdout directly to the output stream
    ytDlpProcess.stdout.pipe(outputStream);

    // Try to extract filename from stderr
    ytDlpProcess.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      console.log('Download progress:', output);
      
      // Parse progress percentage
      if (onProgress) {
        const progressMatch = output.match(/\[download\]\s+([\d.]+)%/);
        if (progressMatch) {
          const progress = Math.min(Math.round(parseFloat(progressMatch[1])), 99);
          onProgress(progress);
        }
      }

      // Extract filename from yt-dlp output
      const filenameMatch = output.match(/\[download\].*?\s+"(.+?)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    });

    ytDlpProcess.on('error', (err) => {
      if (!finished) {
        finished = true;
        clearTimeout(timeout);
        outputStream.destroy();
        reject(new Error('Failed to spawn yt-dlp: ' + err.message));
      }
    });

    ytDlpProcess.on('close', (code) => {
      if (!finished) {
        finished = true;
        clearTimeout(timeout);

        if (code !== 0) {
          console.error('Download error:', stderr);
          outputStream.destroy();
          reject(new Error('Download failed: ' + stderr));
          return;
        }

        // Success - stream has been piped
        console.log('Stream download completed');
        if (onProgress) onProgress(100);
        resolve(filename);
      }
    });
  });
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
