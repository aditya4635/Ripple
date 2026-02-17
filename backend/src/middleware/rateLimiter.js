import { RateLimitError } from "../errors/index.js";

const requestCounts = new Map();

export const rateLimiter = ({
  windowMs = 60 * 1000,
  maxRequests = 5,
  message = "Too many requests, please try again later",
} = {}) => {
  return (req, _res, next) => {
    const key = `${req.ip}:${req.originalUrl}`;
    const now = Date.now();

    if (!requestCounts.has(key)) {
      requestCounts.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    const entry = requestCounts.get(key);

    if (now > entry.resetAt) {
      entry.count = 1;
      entry.resetAt = now + windowMs;
      return next();
    }

    entry.count++;

    if (entry.count > maxRequests) {
      const remainingSeconds = Math.ceil((entry.resetAt - now) / 1000);
      return next(new RateLimitError(message, remainingSeconds));
    }

    next();
  };
};

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of requestCounts.entries()) {
    if (now > entry.resetAt) {
      requestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000);
