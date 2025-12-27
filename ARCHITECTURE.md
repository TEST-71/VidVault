# VidVault - Architecture & Implementation Guide

## System Architecture

### Overview
```
┌─────────────────────────────────────────────────────────────────┐
│                        User's Browser                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           React Frontend Application                      │  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │              UI Components                           │ │  │
│  │  │  ┌──────────┐ ┌────────────┐ ┌──────────────────┐  │ │  │
│  │  │  │Header    │ │URLInput    │ │DownloadProgress│  │ │  │
│  │  │  ├──────────┤ ├────────────┤ ├──────────────────┤  │ │  │
│  │  │  │Footer    │ │VideoPreview│ │DownloadSuccess │  │ │  │
│  │  │  ├──────────┤ ├────────────┤ ├──────────────────┤  │ │  │
│  │  │  │Features  │ │QualitySpec │ │Error Display   │  │ │  │
│  │  │  └──────────┘ └────────────┘ └──────────────────┘  │ │  │
│  │  │                                                      │ │  │
│  │  │  State Management: React Hooks                      │ │  │
│  │  │  - useState for local state                         │ │  │
│  │  │  - useEffect for side effects                       │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │          API Service Layer (api.js)                 │ │  │
│  │  │  - Axios HTTP client                                │ │  │
│  │  │  - Request/Response handling                        │ │  │
│  │  │  - Error handling                                   │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              │ HTTPS / HTTP                      │
│                              ▼                                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Node.js Express Backend                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Middleware Stack                            │  │
│  │  ┌───────────────────────────────────────────────────┐  │  │
│  │  │ CORS Middleware                                   │  │  │
│  │  ├───────────────────────────────────────────────────┤  │  │
│  │  │ Rate Limiter (10 req/min per IP)                  │  │  │
│  │  ├───────────────────────────────────────────────────┤  │  │
│  │  │ Body Parser (JSON)                                │  │  │
│  │  ├───────────────────────────────────────────────────┤  │  │
│  │  │ Custom Error Handler                              │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Route Handlers                              │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │ GET /api/health              ┌──────────────┐  │   │  │
│  │  │ GET /api/platforms           │ Return JSON  │  │   │  │
│  │  │                              └──────────────┘  │   │  │
│  │  ├──────────────────────────────────────────────────┤   │  │
│  │  │ POST /api/validate-url       ┌──────────────┐  │   │  │
│  │  │ POST /api/video/info    ──►  │ Call Utils   │  │   │  │
│  │  │                              │ & Handlers   │  │   │  │
│  │  │                              └──────────────┘  │   │  │
│  │  ├──────────────────────────────────────────────────┤   │  │
│  │  │ POST /api/download           ┌──────────────┐  │   │  │
│  │  │ GET /api/download/progress   │ Manage Jobs  │  │   │  │
│  │  │                              └──────────────┘  │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Service Layer                               │  │
│  │                                                           │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │ config.js                                        │   │  │
│  │  │ - Environment variables                          │   │  │
│  │  │ - Application settings                           │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                                                           │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │ utils.js                                         │   │  │
│  │  │ - URL validation                                 │   │  │
│  │  │ - Platform detection                             │   │  │
│  │  │ - Format conversion functions                    │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                                                           │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │ downloadManager.js                               │   │  │
│  │  │ - Job creation and tracking                      │   │  │
│  │  │ - File cleanup automation                        │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                                                           │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │ platformHandler.js                               │   │  │
│  │  │ - Platform-specific extraction logic             │   │  │
│  │  │ - Metadata parsing                               │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                                                           │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │ middleware.js                                    │   │  │
│  │  │ - Rate limiting implementation                   │   │  │
│  │  │ - Custom middleware functions                    │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              External Services (Future)                   │  │
│  │  ┌──────────┐  ┌─────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │ yt-dlp   │  │ FFmpeg  │  │ Redis    │  │Database  │  │  │
│  │  └──────────┘  └─────────┘  └──────────┘  └──────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### User Downloads Video

```
┌──────────────┐
│  User enters │
│  video URL   │
└──────┬───────┘
       │ onClick
       ▼
┌──────────────────────────────────────────────────┐
│ URLInput Component                               │
│  - Validates URL format                          │
│  - Calls api.validateUrl()                       │
│  - Detects platform (YouTube, Instagram, etc.)   │
└──────┬───────────────────────────────────────────┘
       │ HTTP POST /api/validate-url
       ▼
┌──────────────────────────────────────────────────┐
│ Backend: Validation Endpoint                     │
│  - Checks URL format                             │
│  - Detects platform using detectPlatform()       │
│  - Returns platform info                         │
└──────┬───────────────────────────────────────────┘
       │ Returns validation result
       ▼
┌──────────────────────────────────────────────────┐
│ URLInput Component (cont.)                       │
│  - Calls api.getVideoInfo(url)                   │
│  - Shows loading state                           │
└──────┬───────────────────────────────────────────┘
       │ HTTP POST /api/video/info
       ▼
┌──────────────────────────────────────────────────┐
│ Backend: Video Info Endpoint                     │
│  - Gets platform handler                         │
│  - Calls yt-dlp to fetch metadata                │
│  - Parses available formats/qualities            │
│  - Builds response with all metadata             │
└──────┬───────────────────────────────────────────┘
       │ Returns detailed video metadata
       ▼
┌──────────────────────────────────────────────────┐
│ App.jsx State Updated                            │
│  - videoData = API response                      │
│  - currentStep = 'preview'                       │
│  - Renders VideoPreview & QualitySelector        │
└──────┬───────────────────────────────────────────┘
       │ User selects quality/format
       │ and clicks Download
       ▼
┌──────────────────────────────────────────────────┐
│ QualitySelector Component                        │
│  - Sends download request with selections        │
└──────┬───────────────────────────────────────────┘
       │ HTTP POST /api/download
       │ {url, type, quality, format}
       ▼
┌──────────────────────────────────────────────────┐
│ Backend: Download Endpoint                       │
│  - Creates download job (jobId)                  │
│  - Adds to downloadManager                       │
│  - Queues extraction/conversion work             │
│  - Returns jobId to client                       │
└──────┬───────────────────────────────────────────┘
       │ Returns jobId
       ▼
┌──────────────────────────────────────────────────┐
│ App.jsx Updates                                  │
│  - currentStep = 'downloading'                   │
│  - downloadJobId = jobId                         │
│  - Renders DownloadProgress                      │
└──────┬───────────────────────────────────────────┘
       │ Polling every 1 second
       │ GET /api/download/progress/:jobId
       ▼
┌──────────────────────────────────────────────────┐
│ Backend: Progress Endpoint                       │
│  - Gets job from downloadManager                 │
│  - Returns current progress (0-100)              │
│  - Calculates ETA, speed                         │
└──────┬───────────────────────────────────────────┘
       │ Returns progress info
       ▼
┌──────────────────────────────────────────────────┐
│ DownloadProgress Component                       │
│  - Updates progress bar                          │
│  - Shows speed and ETA                           │
│  - Continues polling until status = 'completed'  │
└──────┬───────────────────────────────────────────┘
       │ status = 'completed'
       ▼
┌──────────────────────────────────────────────────┐
│ App.jsx Updates                                  │
│  - currentStep = 'success'                       │
│  - Renders DownloadSuccess                       │
│  - File auto-deleted after expiry time           │
└──────────────────────────────────────────────────┘
```

## Component Lifecycle

### Initial Load
1. App mounts
2. useState initializes state
3. Renders Header
4. Renders URLInput
5. Renders Features
6. Renders Footer

### URL Submitted
1. URLInput validates
2. Calls backend validate endpoint
3. Calls backend video/info endpoint
4. Updates videoData state
5. Changes step to 'preview'
6. VideoPreview and QualitySelector render

### Download Initiated
1. QualitySelector sends download request
2. Backend creates job
3. Updates state to 'downloading'
4. DownloadProgress mounts
5. Starts polling progress endpoint
6. Updates every 1 second
7. When complete, moves to 'success'

## State Management

```javascript
// App.jsx state
const [currentStep, setCurrentStep] = useState('input');
  // 'input' - initial screen
  // 'preview' - video preview
  // 'downloading' - progress screen
  // 'success' - success screen

const [videoData, setVideoData] = useState(null);
  // Complete video metadata from API

const [downloadJobId, setDownloadJobId] = useState(null);
  // Unique job ID for tracking download

const [isLoading, setIsLoading] = useState(false);
  // Global loading state
```

## API Response Structure

### Video Info Response
```javascript
{
  success: true,
  data: {
    id: "unique-id",
    platform: "youtube",
    type: "video",
    title: "Video Title",
    description: "...",
    thumbnail: "url",
    duration: 600,
    durationFormatted: "10:00",
    creator: {
      username: "channelname",
      displayName: "Full Name",
      profilePicture: "url",
      url: "https://..."
    },
    uploadDate: "2025-12-25T10:00:00Z",
    uploadDateRelative: "2 days ago",
    stats: {
      views: 1000000,
      viewsFormatted: "1M",
      likes: 50000,
      likesFormatted: "50K",
      comments: 2500,
      commentsFormatted: "2.5K"
    },
    dimensions: {
      width: 1920,
      height: 1080
    },
    originalUrl: "https://...",
    availableFormats: {
      video: [
        {
          quality: "1080p",
          resolution: "1920x1080",
          format: "mp4",
          fileSize: 52428800,
          fileSizeFormatted: "50 MB",
          codec: "h264"
        },
        // ... more qualities
      ],
      audio: [
        {
          quality: "320kbps",
          format: "mp3",
          fileSize: 7340032,
          fileSizeFormatted: "7 MB"
        },
        // ... more qualities
      ]
    },
    carouselItems: [],
    hashtags: [],
    mentions: []
  },
  timestamp: "2025-12-25T10:00:00Z"
}
```

## Error Handling Strategy

```javascript
// Frontend
try {
  const response = await videoService.getVideoInfo(url);
  if (response.data.success) {
    // Handle success
  } else {
    setError(response.data.error);
  }
} catch (error) {
  // Handle network errors
  setError(error.response?.data?.error || 'Network error');
}

// Backend
app.post('/api/video/info', async (req, res) => {
  try {
    // Process request
    res.json(successResponse(data));
  } catch (error) {
    res.status(500).json(errorResponse('Error message'));
  }
});
```

## Security Measures

1. **Input Validation**
   - URL format validation
   - Platform whitelist
   - String sanitization

2. **Rate Limiting**
   - 10 requests per minute per IP
   - Prevents abuse
   - Tracking in-memory store

3. **CORS**
   - Restricted to frontend origin
   - Credentials enabled
   - Safe for production

4. **Error Handling**
   - No sensitive data in errors
   - User-friendly messages
   - Logging on backend

## Performance Optimization

1. **Frontend**
   - Lazy loading components
   - Memoization (React.memo)
   - Efficient re-renders

2. **Backend**
   - Caching metadata
   - Async/await for I/O
   - Connection pooling (future)

3. **Network**
   - Compression (gzip)
   - CDN (future)
   - Request batching

## Testing Strategy

### Unit Tests
```javascript
// Test utils
test('validateURLFormat', () => {
  expect(validateURLFormat('https://youtube.com')).toBe(true);
  expect(validateURLFormat('invalid')).toBe(false);
});

// Test components
test('URLInput renders input field', () => {
  render(<URLInput />);
  expect(screen.getByPlaceholderText(/paste/i)).toBeInTheDocument();
});
```

### Integration Tests
```javascript
// Test full flow
test('Download flow', async () => {
  // User inputs URL
  // API returns video data
  // User selects quality
  // Download starts
});
```

## Scaling Considerations

1. **Database**
   - Store analytics
   - User accounts
   - Download history

2. **Message Queue**
   - Redis/RabbitMQ
   - Handle 100+ concurrent users
   - Async job processing

3. **CDN**
   - Serve downloaded files
   - Global distribution
   - Reduce server load

4. **Caching**
   - Cache platform metadata
   - Reduce API calls
   - Improve response time

---

**Document Version**: 1.0
**Last Updated**: December 25, 2025
