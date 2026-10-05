const abtestsService = require('./abtests.service');

async function create(ctx) {
  ctx.status = 201;
  ctx.body = await abtestsService.create(ctx.state.validated.body);
}

module.exports = { create };
