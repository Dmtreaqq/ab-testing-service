const { Worker, UnrecoverableError } = require('bullmq');
const config = require('../config');
const logger = require('../lib/logger');
const { NotFoundError } = require('../lib/errors');
const { workerConnection } = require('../queues/connection');
const { QUEUE_NAME, JOBS } = require('../queues/abtests.queue');
const abtestsService = require('../features/abtests/abtests.service');

const handlers = {
  [JOBS.ACTIVATE]: abtestsService.activate,
  [JOBS.DEACTIVATE]: abtestsService.deactivate,
};

async function processJob(job) {
  const handler = handlers[job.name];
  if (!handler) throw new UnrecoverableError(`Unknown job name: ${job.name}`);

  try {
    const abtest = await handler(job.data.abTestId);
    return { active: abtest.active };
  } catch (err) {
    if (err instanceof NotFoundError) throw new UnrecoverableError(err.message);
    throw err;
  }
}

function createWorker() {
  const worker = new Worker(QUEUE_NAME, processJob, {
    connection: workerConnection,
    concurrency: config.worker.concurrency,
  });

  worker.on('completed', (job, result) => {
    logger.info({ jobId: job.id, abTestId: job.data.abTestId, ...result }, `Job ${job.name} completed`);
  });
  worker.on('failed', (job, err) => {
    logger.error(
      { err, jobId: job?.id, abTestId: job?.data.abTestId, attemptsMade: job?.attemptsMade },
      `Job ${job?.name} failed`,
    );
  });
  worker.on('error', (err) => logger.error({ err }, 'abtests worker error'));

  return worker;
}

module.exports = { createWorker };
