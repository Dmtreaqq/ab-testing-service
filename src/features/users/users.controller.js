const usersService = require('./users.service');

async function list(ctx) {
  ctx.body = await usersService.list();
}

async function getById(ctx) {
  const { id } = ctx.state.validated.params;
  ctx.body = await usersService.getById(id);
}

async function create(ctx) {
  ctx.status = 201;
  ctx.body = await usersService.create(ctx.state.validated.body);
}

async function replace(ctx) {
  const { id } = ctx.state.validated.params;
  ctx.body = await usersService.replace(id, ctx.state.validated.body);
}

async function remove(ctx) {
  const { id } = ctx.state.validated.params;
  await usersService.remove(id);
  ctx.status = 204;
}

module.exports = { list, getById, create, replace, remove };
