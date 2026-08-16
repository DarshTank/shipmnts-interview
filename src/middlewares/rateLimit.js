const ApiError = require('../utils/ApiError');

/**
 * Minimal in-memory fixed-window rate limiter - enough to show you thought
 * about abuse. In production use express-rate-limit backed by Redis, because
 * this counter dies with the process and does not work across instances.
 */
function rateLimit({ windowMs = 60_000, max = 100 } = {}) {
  const hits = new Map();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
      return next(new ApiError(429, 'Too many requests'));
    }
    return next();
  };
}

module.exports = rateLimit;
