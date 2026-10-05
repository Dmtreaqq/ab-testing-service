const createApp = require('./app');
const config = require('./config');
const db = require('./db/knex');
const logger = require('./lib/logger');
const abtestsQueue = require('./queues/abtests.queue');

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info(`Server listening on http://localhost:${config.port}`);
});

abtestsQueue.waitUntilReady().then(
  () => logger.info(`Connected to Redis at ${config.redis.host}:${config.redis.port}`),
  (err) => logger.error({ err }, 'Failed to connect to Redis'),
);

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
      await abtestsQueue.close();
      await db.destroy();
      logger.info('Queue and database connections closed');
      process.exit(err ? 1 : 0);
    } catch (closeErr) {
      logger.error({ err: closeErr }, 'Error closing queue and database connections');
      process.exit(1);
    }
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
