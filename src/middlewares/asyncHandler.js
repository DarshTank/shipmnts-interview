/**
 * Wrap every async controller in this. Without it, a rejected promise inside
 * a route handler never reaches Express's error middleware and the request
 * just hangs. This is the single most common Express bug in interviews.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
