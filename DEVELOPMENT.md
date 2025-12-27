# VidVault Development Guide

## Development Environment Setup

### Prerequisites
- Node.js 16+ with npm
- Git
- A code editor (VS Code recommended)
- Terminal/Command Prompt

### Initial Setup

1. **Clone or navigate to project**
```bash
cd c:\Users\panka\OneDrive\Desktop\VideoDownloader\VidVault
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

3. **Frontend Setup (in new terminal)**
```bash
cd frontend
npm install
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api

## File Structure Deep Dive

### Frontend Components

#### App.jsx
Main component managing application state and routing between screens:
- Input screen
- Preview screen
- Download progress screen
- Success screen

#### URLInput.jsx
- Accepts video URL input
- Validates URL format
- Detects platform
- Calls backend API

#### VideoPreview.jsx
- Displays video thumbnail
- Shows metadata (title, creator, stats)
- Shows duration, views, likes
- Platform badge

#### QualitySelector.jsx
- Content type selection (video/audio/photo)
- Quality dropdown
- Format selection
- File size estimation
- Download button

#### DownloadProgress.jsx
- Real-time progress bar
- Download speed
- ETA
- Job ID

#### DownloadSuccess.jsx
- Success message
- Job ID display
- Download another button

### Backend Structure

#### server.js
Main Express application with routes:
- `/api/health` - Health check
- `/api/platforms` - Platforms list
- `/api/validate-url` - URL validation
- `/api/video/info` - Video metadata
- `/api/download` - Start download
- `/api/download/progress/:jobId` - Progress tracking

#### utils.js
Utility functions:
- `validateURLFormat()` - URL validation
- `detectPlatform()` - Platform detection
- `formatFileSize()` - Format bytes to readable size
- `formatNumber()` - Add commas to numbers
- `formatDuration()` - Convert seconds to HH:MM:SS
- `generateDownloadId()` - Create unique ID
- Response helpers

#### config.js
Configuration management:
- Environment variables
- Default settings
- Getters for different configs

#### middleware.js
Custom middleware:
- Rate limiting implementation
- Rate limit cleanup

#### downloadManager.js
Download job management:
- Create job
- Update progress
- Track status
- Cleanup expired files

#### platformHandler.js
Platform-specific handlers:
- YouTube handler
- Instagram handler
- TikTok handler
- Facebook handler
- Twitter handler

## Development Workflow

### Adding a New Feature

1. **Frontend - Create component**
```jsx
// frontend/src/components/MyComponent.jsx
import React from 'react';

export const MyComponent = ({ prop }) => {
  return <div>My Component</div>;
};

export default MyComponent;
```

2. **Update App.jsx**
```jsx
import MyComponent from './components/MyComponent';

// Add to JSX
<MyComponent prop={value} />
```

3. **Add API call if needed**
```javascript
// frontend/src/services/api.js
myFeature: (param) => api.post('/endpoint', { param }),
```

4. **Backend - Add endpoint**
```javascript
// backend/server.js
app.post('/api/endpoint', (req, res) => {
  const { param } = req.body;
  res.json({ success: true, data: {} });
});
```

5. **Test thoroughly**
- Manual testing in browser
- Check console for errors
- Verify API responses

### Running Tests

```bash
# Backend unit tests (when implemented)
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test

# Build for production
npm run build
```

## API Response Format

All responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": {},
  "timestamp": "2025-12-25T10:30:00Z"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2025-12-25T10:30:00Z"
}
```

## Common Development Tasks

### Modify API Endpoint
1. Update route in `backend/server.js`
2. Test with Postman/curl
3. Update frontend API service
4. Update frontend component

### Add Platform Support
1. Add handler in `backend/platformHandler.js`
2. Add to platforms list in `/api/platforms`
3. Test URL validation

### Change UI Style
1. Modify component JSX
2. Update Tailwind classes
3. Check responsiveness on mobile

### Add Environment Variable
1. Add to `.env.example`
2. Add to `backend/config.js`
3. Use with getter functions

## Debugging

### Backend Debug
```javascript
// Add console logs
console.log('Debug:', variable);

// Use debugger
debugger;

// Set NODE_ENV
NODE_ENV=development npm run dev
```

### Frontend Debug
```javascript
// Console logs
console.log('Debug:', variable);

// React DevTools
// Install React DevTools browser extension

// Network tab
// Check API requests and responses
```

## Performance Considerations

1. **Frontend**
   - Lazy load components
   - Memoize components if needed
   - Optimize re-renders
   - Use React DevTools Profiler

2. **Backend**
   - Cache platform data
   - Implement connection pooling
   - Use async/await properly
   - Monitor memory usage

## Security During Development

1. Never commit .env files
2. Don't log sensitive data
3. Validate all inputs
4. Use HTTPS in production
5. Keep dependencies updated

```bash
npm audit
npm audit fix
```

## Database Setup (For Future Phases)

When adding database:

```bash
# Install MongoDB/PostgreSQL driver
npm install mongoose  # or pg

# Create models
# Create migrations
# Seed data
```

## Testing Strategy

### Unit Tests
```javascript
// Test utilities
import { validateURLFormat } from '../utils';
test('validates URLs', () => {
  expect(validateURLFormat('https://youtube.com')).toBe(true);
});
```

### Integration Tests
```javascript
// Test API endpoints
test('GET /api/health', () => {
  expect(response.status).toBe(200);
});
```

### E2E Tests
```javascript
// Test user flows with Cypress/Playwright
// Visit app
// Submit URL
// Check preview
// Download
```

## Deployment Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] Environment variables set
- [ ] Security headers configured
- [ ] HTTPS enabled
- [ ] Rate limiting enabled
- [ ] Error handling complete
- [ ] API documented
- [ ] README updated
- [ ] License included

## Useful Commands

```bash
# Backend
npm run dev      # Start development server
npm start        # Start production server
npm test         # Run tests

# Frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview build locally

# Both
npm install      # Install dependencies
npm update       # Update dependencies
npm audit        # Check vulnerabilities
```

## Getting Help

1. Check error messages carefully
2. Google the error
3. Check GitHub issues
4. Ask in community forums
5. Create detailed bug reports

## Next Steps

1. Implement real yt-dlp integration
2. Add FFmpeg for format conversion
3. Implement Redis queue system
4. Add database for analytics
5. Create admin dashboard
6. Write comprehensive tests
7. Deploy to production

---

**Happy coding! 🚀**
