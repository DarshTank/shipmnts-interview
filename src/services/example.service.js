const repo = require('../repositories/example.repository');
const ApiError = require('../utils/ApiError');
const { parsePagination, parseSort } = require('../utils/pagination');

/**
 * DELETE THIS FILE at the start of the task.
 *
 * The service layer holds ALL business rules. It knows nothing about req/res
 * and throws ApiError - which is what makes it unit-testable and what makes
 * "now add feature X" a five-minute change instead of a rewrite.
 */

const SORTABLE_FIELDS = ['createdAt', 'updatedAt', 'name'];

async function create(payload) {
  return repo.create(payload);
}

async function getById(id) {
  const found = await repo.findById(id);
  if (!found) throw ApiError.notFound(`Example ${id} not found`);
  return found;
}

async function list(query) {
  const { page, limit, skip } = parsePagination(query);
  const { field, direction } = parseSort(query, SORTABLE_FIELDS);

  const filter = query.search
    ? (row) => String(row.name || '').toLowerCase().includes(String(query.search).toLowerCase())
    : undefined;

  const { items, total } = await repo.findAll({ filter, sortBy: field, direction, skip, limit });
  return { items, page, limit, total };
}

async function update(id, changes, expectedVersion) {
  await getById(id); // 404 before anything else
  try {
    return await repo.update(id, changes, expectedVersion);
  } catch (err) {
    if (err.code === 'VERSION_CONFLICT') {
      throw ApiError.conflict('Record was modified by someone else - refetch and retry');
    }
    throw err;
  }
}

async function remove(id) {
  await getById(id);
  await repo.remove(id);
}

module.exports = { create, getById, list, update, remove };
