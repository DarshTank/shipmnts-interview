const express = require('express');
const { z } = require('zod');

const validate = require('../middlewares/validate');
const idempotency = require('../middlewares/idempotency');
const controller = require('../controllers/example.controller');

/** DELETE THIS FILE at the start of the task - it is a shape reference. */

const router = express.Router();

const createSchema = z.object({
  name: z.string().min(1, 'name is required').max(120),
  description: z.string().max(1000).optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
});

const updateSchema = createSchema.partial();

const idParamSchema = z.object({
  id: z.string().uuid('id must be a valid uuid'),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sort: z.string().optional(),
  search: z.string().optional(),
});

router
  .route('/')
  .get(validate({ query: listQuerySchema }), controller.listExamples)
  .post(idempotency(), validate({ body: createSchema }), controller.createExample);

router
  .route('/:id')
  .get(validate({ params: idParamSchema }), controller.getExample)
  .patch(validate({ params: idParamSchema, body: updateSchema }), controller.updateExample)
  .delete(validate({ params: idParamSchema }), controller.deleteExample);

module.exports = router;
