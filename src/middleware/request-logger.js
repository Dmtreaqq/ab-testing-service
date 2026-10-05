const logger = require('../lib/logger');

module.exports = async function requestLogger(ctx, next) {
  const start = Date.now();
  await next();
  logger.info(
    { method: ctx.method, url: ctx.url, status: ctx.status, durationMs: Date.now() - start },
    'request',
  );
};
