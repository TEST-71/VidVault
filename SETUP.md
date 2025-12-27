# VidVault Setup Guide

## Quick Start

### Option 1: Run with npm

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend API will be available at: `http://localhost:5000`

#### Frontend Setup (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at: `http://localhost:3000`

### Option 2: Using Docker (Coming Soon)

## Project Overview

VidVault is a modern web application that allows users to download videos and extract audio from popular streaming platforms including YouTube, Instagram, TikTok, and more.

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌──────────────────┐
│   Browser   │◄────►│  Frontend App  │◄────►│  Backend API     │
│ (React)     │  HTTP │  (React 18)    │       │  (Node.js/Expr)  │
└─────────────┘         └──────────────┘         └──────────────────┘
                                                          │
                                    ┌─────────────────────┼──────────────────┐
                                    ▼                     ▼                  ▼
                            ┌──────────────┐     ┌──────────────┐    ┌──────────────┐
                            │   yt-dlp     │     │   FFmpeg     │    │  File Temp   │
                            │ (Extraction) │     │ (Processing) │    │  Storage     │
                            └──────────────┘     └──────────────┘    └──────────────┘
```

## Project Structure

```
VidVault/
│
├── frontend/                           # React + Vite Frontend
│   ├── src/
│   │   ├── components/                # Reusable React components
│   │   │   ├── Header.jsx            # App header with branding
│   │   │   ├── Footer.jsx            # Footer component
│   │   │   ├── Features.jsx          # Features showcase
│   │   │   ├── URLInput.jsx          # URL input form
│   │   │   ├── VideoPreview.jsx      # Video metadata display
│   │   │   ├── QualitySelector.jsx   # Download options selector
│   │   │   ├── DownloadProgress.jsx  # Progress tracking
│   │   │   └── DownloadSuccess.jsx   # Success message
│   │   ├── services/
│   │   │   └── api.js               # API client service
│   │   ├── App.jsx                   # Main app component
│   │   ├── main.jsx                  # React entry point
│   │   └── index.css                 # Global styles
│   ├── index.html                     # HTML template
│   ├── vite.config.js                 # Vite configuration
│   ├── tailwind.config.js             # Tailwind CSS config
│   ├── postcss.config.js              # PostCSS config
│   ├── tsconfig.json                  # TypeScript config
│   ├── .env.example                   # Environment template
│   ├── .gitignore                     # Git ignore rules
│   └── package.json                   # Dependencies
│
├── backend/                            # Node.js + Express Backend
│   ├── server.js                       # Main server file
│   ├── utils.js                       # Utility functions
│   ├── config.js                      # Configuration management
│   ├── middleware.js                  # Custom middleware
│   ├── downloadManager.js             # Download job management
│   ├── platformHandler.js             # Platform-specific logic
│   ├── .env.example                   # Environment template
│   ├── .gitignore                     # Git ignore rules
│   └── package.json                   # Dependencies
│
├── video-downloader-technical-specs.md # Full technical specifications
├── SETUP.md                           # This file
├── README.md                          # Project README
└── .gitignore                         # Global git ignore
```

## Frontend Components

### Header
- Logo and branding
- Navigation links
- Support and GitHub links

### URLInput
- Text input for video URLs
- URL validation
- Platform detection
- Error handling

### VideoPreview
- Thumbnail display
- Video metadata (title, creator, duration, views, likes)
- Creator profile information
- Platform badge

### QualitySelector
- Download type selection (video/audio)
- Quality/bitrate options
- Format selection
- File size estimation
- Download button

### DownloadProgress
- Real-time progress bar
- Download speed display
- Estimated time remaining
- Status messages

### DownloadSuccess
- Success confirmation
- Job ID display
- Download again button

## Backend API Endpoints

### Health Check
- `GET /api/health` - Server status

### Validation
- `POST /api/validate-url` - Validate URL and detect platform

### Metadata
- `GET /api/platforms` - Get supported platforms list
- `POST /api/video/info` - Get video metadata and available formats

### Download
- `POST /api/download` - Initiate download
- `GET /api/download/progress/:jobId` - Get download progress

## Supported Platforms

✅ YouTube - Full support for videos
✅ Instagram - Posts, Reels, IGTV
✅ TikTok - Videos and sounds
✅ Facebook - Videos and posts
✅ Twitter/X - Videos and media
🔄 Vimeo - Coming soon
🔄 Dailymotion - Coming soon

## Features Implemented

### Phase 1 - MVP ✅
- [x] Clean, modern UI with Tailwind CSS
- [x] URL input and validation
- [x] Platform detection
- [x] Video metadata display
- [x] Quality/format selection
- [x] Download progress tracking
- [x] Responsive design (mobile, tablet, desktop)
- [x] Error handling
- [x] Rate limiting

### Phase 2 - Enhanced Features 🔄
- [ ] Real yt-dlp integration
- [ ] FFmpeg format conversion
- [ ] Multiple platform support
- [ ] Advanced metadata parsing
- [ ] Subtitle extraction
- [ ] Playlist support

### Phase 3 - Scale & Optimize 📈
- [ ] Redis queue system
- [ ] Database integration
- [ ] Analytics dashboard
- [ ] CDN integration
- [ ] Caching layer

### Phase 4 - Advanced 🎯
- [ ] Batch downloads
- [ ] Webhook notifications
- [ ] Browser extension
- [ ] Desktop application
- [ ] Multi-language support

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
MAX_FILE_SIZE=5000000000
TEMP_DOWNLOAD_PATH=./temp
FILE_EXPIRY_TIME=3600000
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=60000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Installation Requirements

### System Requirements
- Node.js 16.x or higher
- npm 7.x or higher (or yarn/pnpm)
- 2GB RAM minimum
- 500MB disk space minimum

### Optional Requirements (for production)
- Redis (for queue system)
- PostgreSQL or MongoDB (for analytics)
- FFmpeg (for media conversion)
- yt-dlp (for video extraction)

## Common Issues & Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (Backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (Frontend)
lsof -ti:3000 | xargs kill -9
```

### CORS Errors
- Ensure `FRONTEND_URL` matches your frontend URL in backend `.env`
- Check backend server is running

### API Connection Failed
- Verify backend is running on port 5000
- Check `REACT_APP_API_URL` in frontend `.env`
- Check proxy configuration in `vite.config.js`

### Module Not Found
```bash
cd frontend && npm install
cd backend && npm install
```

## Performance Optimization Tips

1. **Caching**: Implement Redis for caching metadata
2. **Compression**: Enable gzip compression
3. **CDN**: Use CDN for downloaded files
4. **Workers**: Use Bull queues for long operations
5. **Database**: Index frequently queried fields

## Security Best Practices

1. Always use HTTPS in production
2. Set rate limiting appropriately
3. Validate all user inputs
4. Use environment variables for secrets
5. Implement CORS properly
6. Add security headers (CSP, X-Frame-Options, etc.)
7. Regular security audits
8. Keep dependencies updated

## Deployment

### Vercel (Frontend)
```bash
npm install -g vercel
vercel
```

### Heroku (Backend)
```bash
heroku login
heroku create vidvault-api
git push heroku main
```

### Docker (Both)
See Dockerfile templates in respective directories.

## Development Tips

### Enable Debug Logging
```javascript
// In backend
process.env.DEBUG = 'vidvault:*'

// In frontend
localStorage.setItem('debug', 'vidvault:*')
```

### Mock API Responses
The current implementation uses mock data. Replace with real API calls:

```javascript
// In platformHandler.js - integrate yt-dlp
// In downloadManager.js - integrate FFmpeg
```

## Contributing Guidelines

1. Follow existing code style
2. Write meaningful commit messages
3. Test thoroughly before submitting
4. Update documentation as needed
5. Follow React best practices
6. Use semantic HTML

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Express.js Documentation](https://expressjs.com)
- [yt-dlp Documentation](https://github.com/yt-dlp/yt-dlp)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)

## Support & Contact

- GitHub Issues: [Report a bug](https://github.com/yourname/vidvault/issues)
- Email: support@vidvault.com
- Discord: [Join community](https://discord.gg/vidvault)

## License

MIT License - See LICENSE file for details

## Changelog

### Version 1.0.0 (December 25, 2025)
- Initial release
- MVP with core features
- Support for 7 platforms
- Quality and format selection
- Progress tracking
- Responsive design

---

**Last Updated**: December 25, 2025
**Maintained by**: VidVault Team
