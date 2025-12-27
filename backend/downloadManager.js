/**
 * Download Manager - Manages download jobs and storage
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { getTempPath, getFileExpiryTime } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DownloadManager {
  constructor() {
    this.downloads = new Map();
    this.initTempDir();
  }

  initTempDir() {
    const tempPath = getTempPath();
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }
  }

  /**
   * Create a new download job
   */
  createJob(url, options) {
    const jobId = uuidv4();
    const job = {
      id: jobId,
      url,
      type: options.type,
      quality: options.quality,
      format: options.format,
      status: 'pending',
      progress: 0,
      speed: '0 MB/s',
      eta: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      filePath: null,
      error: null,
    };

    this.downloads.set(jobId, job);
    return job;
  }

  /**
   * Get download job by ID
   */
  getJob(jobId) {
    return this.downloads.get(jobId);
  }

  /**
   * Update download job
   */
  updateJob(jobId, updates) {
    const job = this.downloads.get(jobId);
    if (!job) return null;

    const updated = {
      ...job,
      ...updates,
      updatedAt: Date.now(),
    };

    this.downloads.set(jobId, updated);
    return updated;
  }

  /**
   * Remove download job
   */
  removeJob(jobId) {
    const job = this.downloads.get(jobId);
    if (job && job.filePath && fs.existsSync(job.filePath)) {
      try {
        fs.unlinkSync(job.filePath);
      } catch (error) {
        console.error(`Failed to delete file for job ${jobId}:`, error);
      }
    }
    this.downloads.delete(jobId);
  }

  /**
   * Clean up expired downloads
   */
  cleanupExpired() {
    const now = Date.now();
    const expiryTime = getFileExpiryTime();

    for (const [jobId, job] of this.downloads.entries()) {
      if (job.status === 'completed' && (now - job.updatedAt) > expiryTime) {
        this.removeJob(jobId);
      }
    }
  }

  /**
   * Get all active downloads
   */
  getActiveDownloads() {
    return Array.from(this.downloads.values())
      .filter(job => job.status === 'processing' || job.status === 'pending');
  }

  /**
   * Generate temporary file path
   */
  generateFilePath(jobId, extension) {
    const tempPath = getTempPath();
    return path.join(tempPath, `${jobId}.${extension}`);
  }
}

export const downloadManager = new DownloadManager();

// Clean up expired downloads every 10 minutes
setInterval(() => {
  downloadManager.cleanupExpired();
}, 600000);

export default downloadManager;
