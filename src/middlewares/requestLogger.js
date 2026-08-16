const logger = require('../utils/logger');

/** Logs method, path, status and duration once the response finishes. */
function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(1)}ms`, {
      requestId: req.id,
    });
  });
  next();
}

module.exports = requestLogger;
