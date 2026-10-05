const Koa = require('koa');
const cors = require('@koa/cors');
const { bodyParser } = require('@koa/bodyparser');
const errorHandler = require('./middleware/error-handler');
const requestLogger = require('./middleware/request-logger');
const routers = require('./routes');

function createApp() {
  const app = new Koa();

  app.use(requestLogger);
  app.use(errorHandler);
  app.use(cors());
  app.use(bodyParser());

  for (const router of routers) {
    app.use(router.routes());
    app.use(router.allowedMethods({ throw: true }));
  }

  return app;
}

module.exports = createApp;
