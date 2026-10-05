const createApp = require('./app');
const config = require('./config');
const db = require('./db/knex');
const logger = require('./lib/logger');

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info(`Server listening on http://localhost:${config.port}`);
});

let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`${signal} received, shutting down gracefully`);

  const forceExit = setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  server.close(async (err) => {
    if (err) logger.error({ err }, 'Error closing HTTP server');
    try {
      await db.destroy();
      logger.info('Database connections closed');
      process.exit(err ? 1 : 0);
    } catch (dbErr) {
      logger.error({ err: dbErr }, 'Error closing database connections');
      process.exit(1);
    }
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
