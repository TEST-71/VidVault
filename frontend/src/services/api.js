import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export const videoService = {
  validateUrl: (url) => api.post('/validate-url', { url }),
  getVideoInfo: (url) => api.post('/video/info', { url }),
  initiateDownload: (url, type, quality, format) =>
    api.post('/download', { url, type, quality, format }),
  getDownloadProgress: (jobId) => api.get(`/download/progress/${jobId}`),
  getPlatforms: () => api.get('/platforms'),
  getHealth: () => api.get('/health'),
};

export default api;
