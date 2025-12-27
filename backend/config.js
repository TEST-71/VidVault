/**
 * Configuration management for VidVault backend
 */

const defaultConfig = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5000000000, // 5GB
  tempDownloadPath: process.env.TEMP_DOWNLOAD_PATH || './temp',
  fileExpiryTime: parseInt(process.env.FILE_EXPIRY_TIME) || 3600000, // 1 hour
  rateLimitRequests: parseInt(process.env.RATE_LIMIT_REQUESTS) || 10,
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000, // 1 minute
};

const config = {
  ...defaultConfig,
  isDevelopment: defaultConfig.nodeEnv === 'development',
  isProduction: defaultConfig.nodeEnv === 'production',
};

export const getConfig = () => config;

export const getPort = () => config.port;

export const getFrontendUrl = () => config.frontendUrl;

export const getTempPath = () => config.tempDownloadPath;

export const getFileExpiryTime = () => config.fileExpiryTime;

export const getRateLimitConfig = () => ({
  requests: config.rateLimitRequests,
  window: config.rateLimitWindow,
});

export default config;
