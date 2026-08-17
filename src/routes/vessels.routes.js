const express = require('express');
const env = require('../config/env');

const router = express.Router();

/** Liveness. Keep it dependency-free so it answers even when the DB is down. */
router.get('/vessels', (req, res) => {
  req.post(

  )
  // res.status(200).json({
  //   success: true,
  //   status: 'ok',
  //   uptimeSeconds: Math.round(process.uptime()),
  //   environment: env.nodey
  // Env,
  //   timestamp: new Date().toISOString(),
  // });
});

/** Readiness. Add real dependency checks (DB ping, cache ping) here. */
router.get('/ready', async (req, res) => {
  const checks = { database: env.databaseUrl ? 'not-wired' : 'in-memory' };
  res.status(200).json({ success: true, status: 'ready', checks });
});

module.exports = router;
