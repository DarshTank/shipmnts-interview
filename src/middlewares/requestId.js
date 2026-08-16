const { randomUUID } = require('crypto');

/** Attaches a request id so logs and error responses can be correlated. */
function requestId(req, res, next) {
  req.id = req.header('x-request-id') || randomUUID();
  res.setHeader('x-request-id', req.id);
  next();
}

module.exports = requestId;
