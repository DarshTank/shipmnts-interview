/**
 * Database connection stub.
 *
 * The app talks to repositories/, never to a driver directly, so you can
 * start on the in-memory store and swap a real DB in here without touching
 * controllers or services.
 *
 * Mongoose:  await mongoose.connect(env.databaseUrl)
 * Postgres:  const pool = new Pool({ connectionString: env.databaseUrl })
 */
const env = require('./env');
const logger = require('../utils/logger');

async function connectDB() {
  if (!env.databaseUrl) {
    logger.info('No DATABASE_URL set - using in-memory store');
    return null;
  }
  // TODO: connect here if you decide to use a real database
  logger.info('DATABASE_URL is set but no driver is wired up yet');
  return null;
}

async function disconnectDB() {
  // TODO: close the connection on shutdown
}

module.exports = { connectDB, disconnectDB };
