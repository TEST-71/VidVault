/**
 * Express rate limiter middleware
 * Alternative to express-rate-limit for simple cases
 */

const rateLimitStore = new Map();

export const createRateLimiter = (options = {}) => {
  const {
    windowMs = 60000,
    max = 10,
    message = 'Too many requests, please try again later.',
  } = options;

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    
    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, []);
    }

    const requests = rateLimitStore.get(key);
    
    // Clean old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    rateLimitStore.set(key, validRequests);

    if (validRequests.length >= max) {
      return res.status(429).json({
        success: false,
        error: message,
      });
    }

    validRequests.push(now);
    next();
  };
};

/**
 * Clean up old rate limit entries periodically
 */
export const startRateLimitCleanup = (intervalMs = 300000) => {
  setInterval(() => {
    const now = Date.now();
    for (const [key, requests] of rateLimitStore.entries()) {
      const validRequests = requests.filter(time => now - time < 3600000);
      if (validRequests.length === 0) {
        rateLimitStore.delete(key);
      } else {
        rateLimitStore.set(key, validRequests);
      }
    }
  }, intervalMs);
};

export default createRateLimiter;
