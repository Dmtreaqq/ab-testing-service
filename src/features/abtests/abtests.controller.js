const abtestsService = require('./abtests.service');

async function list(ctx) {
  ctx.body = await abtestsService.list();
}

async function create(ctx) {
  ctx.status = 201;
  ctx.body = await abtestsService.create(ctx.state.validated.body);
}

async function getVariant(ctx) {
  const { abTestId } = ctx.state.validated.params;
  const { userId } = ctx.state.validated.query;
  ctx.body = await abtestsService.getVariant(abTestId, userId);
}

module.exports = { list, create, getVariant };
