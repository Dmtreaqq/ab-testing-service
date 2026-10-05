const abtestsRepository = require('./abtests.repository');

async function create(data) {
  return abtestsRepository.create(data);
}

module.exports = { create };
