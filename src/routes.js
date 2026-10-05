const { Router } = require('@koa/router');
const healthRouter = require('./features/health/health.routes');
const usersRouter = require('./features/users/users.routes');

const apiRouter = new Router({ prefix: '/api/v1' });
apiRouter.use(usersRouter.routes(), usersRouter.allowedMethods({ throw: true }));

module.exports = [healthRouter, apiRouter];
