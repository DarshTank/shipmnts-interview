/** One response shape for the whole API. Consistency gets graded. */

function ok(res, data, message = 'OK', statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

function created(res, data, message = 'Created') {
  return ok(res, data, message, 201);
}

function noContent(res) {
  return res.status(204).send();
}

/** For list endpoints: keeps meta out of the data array. */
function paginated(res, items, { page, limit, total }, message = 'OK') {
  return res.status(200).json({
    success: true,
    message,
    data: items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
      hasNext: page * limit < total,
    },
  });
}

module.exports = { ok, created, noContent, paginated };
