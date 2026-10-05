const { Queue } = require('bullmq');
const { producerConnection } = require('./connection');
const logger = require('../lib/logger');

const QUEUE_NAME = 'abtests';

const JOBS = {
  ACTIVATE: 'activate',
  DEACTIVATE: 'deactivate',
};

const queue = new Queue(QUEUE_NAME, {
  connection: producerConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: { age: 7 * 24 * 3600 },
  },
});

queue.on('error', (err) => logger.error({ err }, 'abtests queue error'));

function jobId(name, abTestId) {
  return `${name}-${abTestId}`;
}

function delays(abtest, now) {
  return {
    activate: Math.max(0, new Date(abtest.dateStart).getTime() - now),
    deactivate: Math.max(0, new Date(abtest.dateEnd).getTime() - now),
  };
}

function hasEnded(abtest, now) {
  return new Date(abtest.dateEnd).getTime() <= now;
}

function addJob(name, abTestId, delay) {
  return queue.add(name, { abTestId }, { jobId: jobId(name, abTestId), delay });
}

async function scheduleAbtest(abtest, now = Date.now()) {
  if (hasEnded(abtest, now)) return;

  const delay = delays(abtest, now);
  if (!abtest.active) await addJob(JOBS.ACTIVATE, abtest.id, delay.activate);
  await addJob(JOBS.DEACTIVATE, abtest.id, delay.deactivate);
}

// Unlike add(), retries a job kept in the failed set: re-adding an existing jobId is a no-op.
async function ensureJob(name, abTestId, delay) {
  const job = await queue.getJob(jobId(name, abTestId));
  if (!job) {
    await addJob(name, abTestId, delay);
    return 'added';
  }

  if ((await job.getState()) === 'failed') {
    await job.retry();
    return 'retried';
  }

  return 'exists';
}

async function ensureAbtestJobs(abtest, now = Date.now()) {
  if (hasEnded(abtest, now)) return {};

  const delay = delays(abtest, now);
  const result = {};
  if (!abtest.active) result.activate = await ensureJob(JOBS.ACTIVATE, abtest.id, delay.activate);
  result.deactivate = await ensureJob(JOBS.DEACTIVATE, abtest.id, delay.deactivate);
  return result;
}

function waitUntilReady() {
  return queue.waitUntilReady();
}

function close() {
  return queue.close();
}

module.exports = {
  QUEUE_NAME,
  JOBS,
  scheduleAbtest,
  ensureAbtestJobs,
  waitUntilReady,
  close,
};
