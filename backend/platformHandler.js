/**
 * Platform-specific handlers for different video sources
 */

import { formatDuration, formatNumber } from './utils.js';

class PlatformHandler {
  /**
   * Handle YouTube URLs
   */
  static handleYouTube(url) {
    return {
      id: 'mock-video-id',
      title: 'Sample YouTube Video Title',
      description: 'This is a sample YouTube video description that would normally be fetched using yt-dlp.',
      thumbnailUrl: 'https://via.placeholder.com/320x180?text=YouTube+Thumbnail',
      duration: 600,
      uploader: 'Sample Channel',
      uploaderUrl: 'https://youtube.com/@samplechannel',
      uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: 1000000,
      likeCount: 50000,
    };
  }

  /**
   * Handle Instagram URLs
   */
  static handleInstagram(url) {
    return {
      id: 'mock-post-id',
      title: 'Instagram Post',
      description: 'Sample Instagram post caption.',
      thumbnailUrl: 'https://via.placeholder.com/320x180?text=Instagram+Post',
      uploader: 'instagram.user',
      uploaderUrl: 'https://instagram.com/instagram.user',
      uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      likeCount: 500,
      commentCount: 25,
      type: 'photo', // photo, video, carousel
    };
  }

  /**
   * Handle TikTok URLs
   */
  static handleTikTok(url) {
    return {
      id: 'mock-tiktok-id',
      title: 'TikTok Video',
      description: 'Sample TikTok video description.',
      thumbnailUrl: 'https://via.placeholder.com/320x180?text=TikTok+Video',
      duration: 30,
      uploader: 'tiktok.creator',
      uploaderUrl: 'https://tiktok.com/@tiktok.creator',
      uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      likeCount: 10000,
      commentCount: 500,
      shareCount: 2000,
    };
  }

  /**
   * Get platform-specific handler
   */
  static getHandler(platform) {
    const handlers = {
      youtube: this.handleYouTube,
      instagram: this.handleInstagram,
      tiktok: this.handleTikTok,
      facebook: this.handleFacebook,
      twitter: this.handleTwitter,
    };

    return handlers[platform] || null;
  }

  /**
   * Handle Facebook URLs
   */
  static handleFacebook(url) {
    return {
      id: 'mock-facebook-id',
      title: 'Facebook Video',
      thumbnailUrl: 'https://via.placeholder.com/320x180?text=Facebook+Video',
      uploader: 'Sample User',
      uploadDate: new Date().toISOString(),
    };
  }

  /**
   * Handle Twitter/X URLs
   */
  static handleTwitter(url) {
    return {
      id: 'mock-twitter-id',
      title: 'Twitter/X Post',
      description: 'Sample tweet content.',
      uploader: '@twitter_user',
      uploadDate: new Date().toISOString(),
    };
  }
}

export default PlatformHandler;
