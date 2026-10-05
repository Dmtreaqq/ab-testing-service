const config = require('./config');
const db = require('./db/knex');
const logger = require('./lib/logger');
const abtestsQueue = require('./queues/abtests.queue');
const abtestsService = require('./features/abtests/abtests.service');
const { createWorker } = require('./workers/abtests.worker');

let worker;
let shuttingDown = false;

async function start() {
  await abtestsQueue.waitUntilReady();
  logger.info(`Connected to Redis at ${config.redis.host}:${config.redis.port}`);

  const { deactivated, scheduled } = await abtestsService.reconcileSchedules();
  logger.info({ deactivated, scheduled }, 'Reconciled abtest schedules');

  worker = createWorker();
  logger.info('Worker started');
}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`${signal} received, shutting down gracefully`);

  const forceExit = setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  try {
    if (worker) await worker.close();
    await abtestsQueue.close();
    await db.destroy();
    logger.info('Worker, queue and database connections closed');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Error during worker shutdown');
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start().catch((err) => {
  logger.error({ err }, 'Worker failed to start');
  process.exit(1);
});
