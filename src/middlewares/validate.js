const ApiError = require('../utils/ApiError');

/**
 * Zod validation middleware.
 *
 *   router.post('/', validate({ body: createSchema }), controller.create)
 *
 * On success it REPLACES req.body/query/params with the parsed values, so
 * everything downstream is already coerced and typed. On failure it throws a
 * 400 with a field-by-field error list.
 */
function validate(schemas = {}) {
  return (req, res, next) => {
    const errors = [];

    for (const key of ['body', 'query', 'params']) {
      const schema = schemas[key];
      if (!schema) continue;

      const result = schema.safeParse(req[key]);
      if (result.success) {
        // req.query/params are getter-only in Express 5; assign defensively.
        try {
          req[key] = result.data;
        } catch (_) {
          Object.defineProperty(req, key, { value: result.data, writable: true });
        }
      } else {
        for (const issue of result.error.issues) {
          errors.push({
            in: key,
            field: issue.path.join('.') || key,
            message: issue.message,
          });
        }
      }
    }

    if (errors.length) return next(ApiError.badRequest('Validation failed', errors));
    return next();
  };
}

module.exports = validate;
