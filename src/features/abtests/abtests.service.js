const abtestsRepository = require('./abtests.repository');
const { NotFoundError } = require('../../lib/errors');

const INACTIVE_VARIANT = 0;

async function list() {
  return abtestsRepository.findAll();
}

async function create(data) {
  return abtestsRepository.create(data);
}

async function activate(abTestId) {
  const activated = await abtestsRepository.activate(abTestId);
  if (activated) return activated;

  const abtest = await abtestsRepository.findById(abTestId);
  if (!abtest) throw new NotFoundError('A/B test not found');
  return abtest;
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

module.exports = { list, create, activate, getVariant };
