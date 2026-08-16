const ApiError = require('../utils/ApiError');

/**
 * Idempotency-Key support for POST endpoints.
 *
 * If a client times out and retries a create, you must not create the resource
 * twice. Client sends `Idempotency-Key: <uuid>`; the first response for that key
 * is cached and replayed on any retry.
 *
 * Mentioning this in a backend interview is a strong signal. Back it with Redis
 * (with a TTL) in production - this Map is per-process and unbounded.
 */
function idempotency({ ttlMs = 10 * 60_000, required = false } = {}) {
  const store = new Map();

  return (req, res, next) => {
    const key = req.header('idempotency-key');

    if (!key) {
      if (required) return next(ApiError.badRequest('Idempotency-Key header is required'));
      return next();
    }

    const cached = store.get(key);
    if (cached && Date.now() < cached.expiresAt) {
      res.setHeader('x-idempotent-replay', 'true');
      return res.status(cached.statusCode).json(cached.body);
    }

    // Capture the response body so a retry can replay it.
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode < 400) {
        store.set(key, { statusCode: res.statusCode, body, expiresAt: Date.now() + ttlMs });
      }
      return originalJson(body);
    };

    return next();
  };
}

module.exports = idempotency;
