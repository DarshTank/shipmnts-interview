const express = require('express');

const healthRoutes = require('./health.routes');
const exampleRoutes = require('./example.routes');

const router = express.Router();

// Mount new resources here. One line per resource keeps the wiring obvious.
router.use('/examples', exampleRoutes);

module.exports = { apiRouter: router, healthRoutes };
