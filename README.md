# VidVault - Video/Audio Downloader

A modern, full-stack web application for downloading videos and extracting audio from popular streaming platforms.

## Project Structure

```
VidVault/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API service
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── backend/                  # Node.js + Express backend
│   ├── server.js            # Main server file
│   ├── .env.example
│   └── package.json
├── video-downloader-technical-specs.md  # Full specifications
└── README.md
```

## Features

✨ **Multi-Platform Support**
- YouTube
- Instagram
- TikTok
- Facebook
- Twitter/X
- Vimeo
- Dailymotion

🎬 **Video Options**
- Multiple quality levels (240p - 4K)
- Multiple formats (MP4, WebM, MKV)
- File size estimation

🎵 **Audio Options**
- Multiple bitrates (64kbps - 320kbps)
- Multiple formats (MP3, M4A, WAV, OGG, OPUS)

🚀 **Performance Features**
- Real-time progress tracking
- Download speed display
- Estimated time remaining
- Rate limiting and security

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend will run on `http://localhost:5000`

2. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Validation
- `POST /api/validate-url` - Validate and detect platform

### Video Information
- `POST /api/video/info` - Get video metadata
- `GET /api/platforms` - Get supported platforms

### Download
- `POST /api/download` - Initiate download
- `GET /api/download/progress/:jobId` - Track download progress

## Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express.js** - Framework
- **yt-dlp** - Video extraction
- **FFmpeg** - Format conversion
- **Bull/Redis** - Queue system (optional)

## Development Phases

### Phase 1 - MVP ✅
- Basic UI with URL input
- YouTube support
- Single quality option
- MP4 and MP3 formats

### Phase 2 - Enhanced Features 🔄
- Multiple quality options
- Additional format support
- Instagram and TikTok support
- Progress tracking

### Phase 3 - Scale & Optimize 📈
- Additional platforms
- Queue system
- CDN integration
- Performance optimization

### Phase 4 - Advanced Features 🎯
- Batch downloads
- Playlist support
- Subtitle download
- Browser extension

## Security

- Rate limiting (10 requests/minute per IP)
- Input sanitization
- HTTPS enforced in production
- CORS configured
- Content Security Policy headers
- No user data storage

## Legal & Compliance

- Terms of Service required
- Privacy Policy (GDPR compliant)
- DMCA compliance procedure
- Age-appropriate content warnings
- Copyright disclaimer

## File Cleanup

- Automatic deletion after 1 hour
- Temporary storage only
- No long-term storage

## Performance Targets

- Video info retrieval: < 3 seconds
- Download initiation: < 5 seconds
- Concurrent downloads: 10+ simultaneous users
- File cleanup: automatic after 1 hour

## Error Handling

Comprehensive error handling for:
- Invalid URLs
- Unsupported platforms
- Unavailable videos
- Age-restricted content
- Network timeouts
- Format conversion failures

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Roadmap

- [ ] Implementation of yt-dlp integration
- [ ] FFmpeg format conversion
- [ ] Redis queue system
- [ ] Database for analytics
- [ ] Admin dashboard
- [ ] Webhook notifications
- [ ] API rate limit dashboard
- [ ] Multi-language support

---

**Made with ❤️ by VidVault Team**

Generated: December 25, 2025
