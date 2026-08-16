const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const logger = require('../utils/logger');

/**
 * The single place errors become HTTP responses.
 * Must have four arguments - that is how Express recognises error middleware.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || [];

  // Malformed JSON body from express.json()
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }

  if (!(err instanceof ApiError) && statusCode === 500) {
    logger.error(err.message, { requestId: req.id, stack: err.stack });
    // Never leak internals to the client in production.
    if (env.isProd) message = 'Internal server error';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length ? { errors } : {}),
    requestId: req.id,
    ...(env.isProd ? {} : { stack: err.stack }),
  });
}

module.exports = errorHandler;
