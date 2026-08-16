const asyncHandler = require('../middlewares/asyncHandler');
const { ok, created, noContent, paginated } = require('../utils/ApiResponse');
const service = require('../services/example.service');

/**
 * DELETE THIS FILE at the start of the task.
 *
 * Controllers stay dumb on purpose: read the request, call the service,
 * shape the response. No business logic, no storage access.
 */

const createExample = asyncHandler(async (req, res) => {
  const record = await service.create(req.body);
  res.setHeader('Location', `${req.baseUrl}/${record.id}`);
  return created(res, record, 'Example created');
});

const getExample = asyncHandler(async (req, res) => {
  const record = await service.getById(req.params.id);
  return ok(res, record);
});

const listExamples = asyncHandler(async (req, res) => {
  const { items, page, limit, total } = await service.list(req.query);
  return paginated(res, items, { page, limit, total });
});

const updateExample = asyncHandler(async (req, res) => {
  const expectedVersion = req.header('if-match') ? Number(req.header('if-match')) : undefined;
  const record = await service.update(req.params.id, req.body, expectedVersion);
  return ok(res, record, 'Example updated');
});

const deleteExample = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  return noContent(res);
});

module.exports = { createExample, getExample, listExamples, updateExample, deleteExample };
