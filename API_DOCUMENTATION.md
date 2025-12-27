# VidVault API Documentation

## Overview

VidVault Backend provides REST API endpoints for video downloading functionality. The frontend communicates with these endpoints to fetch metadata, initiate downloads, and track progress.

---

## Base URL

```
http://localhost:5000/api
```

---

## Authentication

Currently, no authentication is required. All endpoints are public.

---

## Rate Limiting

- **Limit**: 30 requests per 60 seconds
- **Per IP**: Applied globally
- **Response**: 429 Too Many Requests when exceeded

---

## Endpoints

### 1. Get Video Information

**Endpoint:** `POST /api/video/info`

**Purpose:** Fetch video metadata and available formats using yt-dlp

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "dQw4w9WgXcQ",
    "platform": "youtube",
    "title": "Rick Astley - Never Gonna Give You Up",
    "description": "The official video for...",
    "thumbnail": "https://...",
    "duration": 212,
    "durationFormatted": "3:32",
    "uploader": "Rick Astley",
    "uploadDate": "2009-10-25",
    "viewCount": 1234567890,
    "likeCount": 12345678,
    "width": 1920,
    "height": 1080,
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "originalUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "availableFormats": {
      "video": [
        {
          "quality": "1080p",
          "format": "mp4",
          "fileSize": 245000000,
          "fileSizeFormatted": "245 MB",
          "formatId": "22"
        },
        {
          "quality": "720p",
          "format": "mp4",
          "fileSize": 120000000,
          "fileSizeFormatted": "120 MB",
          "formatId": "18"
        }
      ],
      "audio": [
        {
          "quality": "high (320kbps)",
          "format": "mp3",
          "fileSize": 12000000,
          "fileSizeFormatted": "12 MB",
          "formatId": "251"
        }
      ]
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Failed to fetch video information: [error details]"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid URL or fetch failed
- `429` - Rate limited

---

### 2. Initiate Download

**Endpoint:** `POST /api/download`

**Purpose:** Start a real download job and return a unique jobId for tracking

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "type": "video",
  "quality": "720p",
  "format": "mp4"
}
```

**Request Parameters:**
- `url` (required) - Video URL to download
- `type` (required) - Either "video" or "audio"
- `quality` (required) - Quality level (e.g., "720p", "1080p", "high (320kbps)")
- `format` (required) - File format (e.g., "mp4", "mp3", "wav")

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "jobId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "processing",
    "message": "Download initiated. Use the jobId to check progress."
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Missing required parameters: url, type, quality, format"
}
```

**Status Codes:**
- `200` - Download job created
- `400` - Missing or invalid parameters
- `429` - Rate limited
- `500` - Server error

---

### 3. Get Download Progress

**Endpoint:** `GET /api/download/progress/:jobId`

**Purpose:** Poll the progress of an ongoing download

**URL Parameters:**
- `jobId` (required) - UUID of the download job

**Response (In Progress):**
```json
{
  "success": true,
  "data": {
    "jobId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "processing",
    "progress": 45,
    "downloadSpeed": "2.5 MB/s",
    "eta": 120,
    "error": null
  }
}
```

**Response (Completed):**
```json
{
  "success": true,
  "data": {
    "jobId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "progress": 100,
    "downloadSpeed": "2.5 MB/s",
    "eta": 0,
    "error": null
  }
}
```

**Response (Failed):**
```json
{
  "success": true,
  "data": {
    "jobId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "failed",
    "progress": 0,
    "downloadSpeed": "0 MB/s",
    "eta": 0,
    "error": "Failed to download: Video unavailable"
  }
}
```

**Status Codes:**
- `200` - Success (returns current status)
- `404` - Job ID not found
- `429` - Rate limited

**Job Statuses:**
- `processing` - Download is ongoing
- `completed` - Download finished successfully
- `failed` - Download failed

---

### 4. Download File

**Endpoint:** `GET /api/download/file/:jobId`

**Purpose:** Download the completed file to your computer

**URL Parameters:**
- `jobId` (required) - UUID of the completed download job

**Response (Success):**
- File binary data (browser will download)
- Content-Type: Auto-detected from file
- Content-Disposition: attachment (triggers download)

**Response (Error):**
```json
{
  "success": false,
  "error": "Download is processing. Cannot retrieve file."
}
```

**Status Codes:**
- `200` - File sent for download
- `400` - Download not completed yet
- `404` - Job ID not found or file deleted
- `429` - Rate limited

**Auto-Cleanup:**
After successful download:
1. File is sent to browser
2. Server waits 1 second
3. Temporary directory is deleted
4. Job is removed from activeDownloads

---

### 5. Validate URL

**Endpoint:** `POST /api/validate-url`

**Purpose:** Validate URL format and detect platform

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "platform": "youtube",
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid URL format"
}
```

**Status Codes:**
- `200` - Valid URL
- `400` - Invalid URL format
- `429` - Rate limited

---

### 6. Get Supported Platforms

**Endpoint:** `GET /api/platforms`

**Purpose:** Get list of supported video platforms

**Request:** No parameters needed

**Response:**
```json
{
  "success": true,
  "data": {
    "platforms": [
      {
        "id": "youtube",
        "name": "YouTube",
        "icon": "▶️"
      },
      {
        "id": "instagram",
        "name": "Instagram",
        "icon": "📷"
      },
      {
        "id": "tiktok",
        "name": "TikTok",
        "icon": "🎵"
      },
      {
        "id": "facebook",
        "name": "Facebook",
        "icon": "👍"
      },
      {
        "id": "twitter",
        "name": "Twitter/X",
        "icon": "𝕏"
      },
      {
        "id": "vimeo",
        "name": "Vimeo",
        "icon": "▶️"
      },
      {
        "id": "dailymotion",
        "name": "Dailymotion",
        "icon": "▶️"
      }
    ]
  }
}
```

**Status Codes:**
- `200` - Success
- `429` - Rate limited

---

### 7. Health Check

**Endpoint:** `GET /api/health`

**Purpose:** Check if backend is running and healthy

**Request:** No parameters needed

**Response:**
```json
{
  "status": "ok",
  "message": "VidVault Backend is running"
}
```

**Status Codes:**
- `200` - Backend is healthy

---

## Common Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "URL is required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Download job not found"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": "Too many requests, please try again later"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Frontend Implementation Example

### Using the Axios Client

```javascript
import { videoService } from './services/api.js';

// Get video info
const response = await videoService.getVideoInfo(url);
const videoData = response.data.data;

// Start download
const downloadResponse = await videoService.initiateDownload(
  url, 
  'video', 
  '720p', 
  'mp4'
);
const jobId = downloadResponse.data.data.jobId;

// Poll progress
const progressResponse = await videoService.getDownloadProgress(jobId);
const progress = progressResponse.data.data.progress;

// Download file
window.location.href = `http://localhost:5000/api/download/file/${jobId}`;
```

---

## Response Format

All API responses follow a consistent format:

**Success:**
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

---

## Timeouts

- **Metadata Fetch**: 60 seconds
- **Download**: 600 seconds (10 minutes)
- **Progress Polling**: No timeout

---

## File Size Limits

- **Maximum video duration**: Unlimited (depends on platform)
- **Maximum file size**: Unlimited (depends on disk space)
- **Temporary storage**: Automatically cleaned up after download

---

## Supported Quality Levels

### Video Qualities
- 2160p (4K)
- 1440p (QHD)
- 1080p (Full HD)
- 720p (HD)
- 480p (SD)
- 360p (Lower)
- 240p (Lowest)

### Audio Qualities
- 320 kbps (High)
- 256 kbps
- 192 kbps (Medium)
- 128 kbps (Low)
- 64 kbps (Very Low)

### Video Formats
- MP4
- WebM
- MKV

### Audio Formats
- MP3
- M4A
- WAV
- OPUS

---

## Example Workflow

```
1. User enters URL
   POST /api/video/info
   ← Returns available formats and qualities

2. User selects quality
   POST /api/download
   ← Returns jobId

3. Poll progress every 500ms
   GET /api/download/progress/{jobId}
   ← Returns progress 0-100%

4. When progress reaches 100%
   GET /api/download/file/{jobId}
   ← Browser downloads file

5. Server cleanup
   Temp files auto-deleted
```

---

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:3002`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:3001`
- `http://127.0.0.1:3002`

To add more origins, edit `backend/server.js` CORS configuration.

---

## Rate Limiting

API enforces rate limiting:
- **30 requests per 60 seconds per IP**
- Applied to all endpoints
- Returns 429 status when exceeded

---

## Testing with cURL

```bash
# Get video info
curl -X POST http://localhost:5000/api/video/info \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

# Check health
curl http://localhost:5000/api/health

# Get platforms
curl http://localhost:5000/api/platforms
```

---

## Troubleshooting

### Connection Refused
- Verify backend is running on port 5000
- Check: `http://localhost:5000/api/health`

### CORS Error
- Frontend and backend running on same machine?
- Check CORS configuration in server.js

### Download Fails
- Video accessible and not restricted?
- Try a different video or platform
- Check backend logs for errors

### Rate Limited
- Too many requests too quickly
- Wait 60 seconds and try again

---

## Support

For issues or questions:
1. Check backend logs for error messages
2. Verify yt-dlp is installed: `python -m yt_dlp --version`
3. Test individual endpoints with cURL
4. Check CORS configuration

