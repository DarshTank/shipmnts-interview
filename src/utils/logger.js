/**
 * Tiny structured logger. Swap for pino/winston if the task calls for it.
 * Dependency-free = one less thing to install under time pressure.
 */
const env = require('../config/env');

function write(level, message, meta) {
  if (env.isTest) return;
  const line = { level, time: new Date().toISOString(), message, ...(meta ? { meta } : {}) };
  const out = level === 'error' ? console.error : console.log;
  out(env.isProd ? JSON.stringify(line) : `[${level}] ${message}${meta ? ' ' + JSON.stringify(meta) : ''}`);
}

module.exports = {
  info: (m, meta) => write('info', m, meta),
  warn: (m, meta) => write('warn', m, meta),
  error: (m, meta) => write('error', m, meta),
};
