const express = require("express");

const healthRoutes = require("./health.routes");
const exampleRoutes = require("./example.routes");
const vesselsRoutes = require("./vessels.routes");

const router = express.Router();

// Mount new resources here. One line per resource keeps the wiring obvious.
router.use("/examples", exampleRoutes);
router.use("/vessels", vesselsRoutes);

// module.exports = router;
module.exports = { apiRouter: router, healthRoutes };
module.exports = { apiRouter: router, vesselsRoutes };
