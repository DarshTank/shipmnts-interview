const ApiError = require('../utils/ApiError');

/** Mounted after all routes: turns an unmatched path into a proper 404 JSON. */
function notFound(req, res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

module.exports = notFound;
