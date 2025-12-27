import express from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Utility function to validate URL format
 */
export const validateURLFormat = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Detect platform from URL
 */
export const detectPlatform = (url) => {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return 'youtube';
  } else if (urlLower.includes('instagram.com')) {
    return 'instagram';
  } else if (urlLower.includes('tiktok.com')) {
    return 'tiktok';
  } else if (urlLower.includes('facebook.com')) {
    return 'facebook';
  } else if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
    return 'twitter';
  } else if (urlLower.includes('vimeo.com')) {
    return 'vimeo';
  } else if (urlLower.includes('dailymotion.com')) {
    return 'dailymotion';
  }
  
  return 'unknown';
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format duration in seconds to HH:MM:SS
 */
export const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Generate unique download ID
 */
export const generateDownloadId = () => {
  return uuidv4();
};

/**
 * Error response helper
 */
export const errorResponse = (message, code = 500) => {
  return {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Success response helper
 */
export const successResponse = (data) => {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
};

export default {
  validateURLFormat,
  detectPlatform,
  formatFileSize,
  formatNumber,
  formatDuration,
  generateDownloadId,
  errorResponse,
  successResponse,
};
