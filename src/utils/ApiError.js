/**
 * Any error thrown with this class becomes a clean HTTP response.
 * Anything else becomes a 500 - which is exactly what you want.
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', errors = []) {
    return new ApiError(400, message, errors);
  }
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }
  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }
  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }
  /** State conflicts: duplicate create, invalid status transition, version mismatch. */
  static conflict(message = 'Conflict') {
    return new ApiError(409, message);
  }
  /** Syntactically valid but semantically wrong (a business rule failed). */
  static unprocessable(message = 'Unprocessable entity', errors = []) {
    return new ApiError(422, message, errors);
  }
}

module.exports = ApiError;
