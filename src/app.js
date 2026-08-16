const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const requestId = require('./middlewares/requestId');
const requestLogger = require('./middlewares/requestLogger');
const rateLimit = require('./middlewares/rateLimit');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const { apiRouter, healthRoutes } = require('./routes');

const app = express();

// --- Order matters, and they will ask about it ---
app.use(helmet());                                   // security headers
app.use(cors());                                     // tighten origin in prod
app.use(express.json({ limit: '1mb' }));             // parse body BEFORE routes
app.use(express.urlencoded({ extended: true }));
app.use(requestId);                                  // correlate logs
app.use(requestLogger);
app.use(rateLimit({ windowMs: 60_000, max: 300 }));

// Health checks stay unversioned so infra can always reach them.
app.use('/', healthRoutes);

// Versioned API surface.
app.use('/api/v1', apiRouter);

// 404 for anything unmatched, then the single error handler. Both go LAST.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
