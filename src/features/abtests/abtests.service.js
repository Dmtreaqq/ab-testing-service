const abtestsRepository = require('./abtests.repository');
const abtestsQueue = require('../../queues/abtests.queue');
const { NotFoundError } = require('../../lib/errors');
const logger = require('../../lib/logger');

const INACTIVE_VARIANT = 0;

async function list() {
  return abtestsRepository.findAll();
}

async function create(data) {
  const abtest = await abtestsRepository.create({ ...data, active: false });

  try {
    await abtestsQueue.scheduleAbtest(abtest);
  } catch (err) {
    logger.error({ err, abTestId: abtest.id }, 'Failed to schedule abtest jobs');
  }

  return abtest;
}

async function activate(abTestId) {
  const activated = await abtestsRepository.activate(abTestId);
  if (activated) return activated;

  const abtest = await abtestsRepository.findById(abTestId);
  if (!abtest) throw new NotFoundError('A/B test not found');
  return abtest;
}

async function deactivate(abTestId) {
  const deactivated = await abtestsRepository.deactivate(abTestId);
  if (deactivated) return deactivated;

  const abtest = await abtestsRepository.findById(abTestId);
  if (!abtest) throw new NotFoundError('A/B test not found');
  return abtest;
}

async function reconcileSchedules() {
  const deactivated = await abtestsRepository.deactivateEnded();
  const abtests = await abtestsRepository.findNotEnded();

  const scheduled = [];
  for (const abtest of abtests) {
    scheduled.push({ abTestId: abtest.id, ...(await abtestsQueue.ensureAbtestJobs(abtest)) });
  }

  return { deactivated: deactivated.map((abtest) => abtest.id), scheduled };
}

function isRunning(abtest, now = new Date()) {
  return abtest.active && now >= abtest.dateStart && now <= abtest.dateEnd;
}

async function getVariant(abTestId, userId) {
  const abtest = await abtestsRepository.findById(abTestId);
  if (!abtest) throw new NotFoundError('A/B test not found');

  if (!isRunning(abtest)) return { variant: INACTIVE_VARIANT };

  const existing = await abtestsRepository.findVariant(abTestId, userId);
  if (existing !== null) return { variant: existing };

  const variant = await abtestsRepository.assignVariant(abTestId, userId, abtest.variantsCount);
  return { variant };
}

module.exports = { list, create, activate, deactivate, reconcileSchedules, getVariant };
