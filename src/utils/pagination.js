const MAX_LIMIT = 100;

/** Normalises ?page & ?limit into safe numbers. Never trust req.query. */
function parsePagination(query = {}) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);
  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(limit) || limit < 1) limit = 10;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;
  return { page, limit, skip: (page - 1) * limit };
}

/**
 * Only allow sorting on whitelisted fields - otherwise a client can sort on
 * an unindexed column and take your database down.
 */
function parseSort(query = {}, allowed = [], fallback = 'createdAt') {
  const raw = String(query.sort || fallback);
  const desc = raw.startsWith('-');
  const field = desc ? raw.slice(1) : raw;
  const safeField = allowed.includes(field) ? field : fallback;
  return { field: safeField, direction: desc ? -1 : 1 };
}

module.exports = { parsePagination, parseSort, MAX_LIMIT };
