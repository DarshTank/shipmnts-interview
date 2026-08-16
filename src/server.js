const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const { connectDB, disconnectDB } = require('./config/db');

async function start() {
  await connectDB();

  const server = app.listen(env.port, () => {
    logger.info(`Server listening on http://localhost:${env.port} [${env.nodeEnv}]`);
  });

  // Graceful shutdown - stop accepting connections, drain, then exit.
  const shutdown = (signal) => async () => {
    logger.info(`${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', shutdown('SIGTERM'));
  process.on('SIGINT', shutdown('SIGINT'));

  // A crash you cannot recover from should crash loudly, not silently corrupt.
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason: String(reason) });
    server.close(() => process.exit(1));
  });
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { message: err.message, stack: err.stack });
    process.exit(1);
  });
}

start();
