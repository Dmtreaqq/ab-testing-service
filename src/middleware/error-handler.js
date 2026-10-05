const { STATUS_CODES } = require('node:http');
const { AppError } = require('../lib/errors');
const logger = require('../lib/logger');

module.exports = async function errorHandler(ctx, next) {
  try {
    await next();
  } catch (err) {
    if (err instanceof AppError) {
      ctx.status = err.status;
      ctx.body = { message: err.message, details: err.details };
      return;
    }

    if (err.status >= 400 && err.status < 500) {
      ctx.status = err.status;
      ctx.body = { message: err.expose ? err.message : STATUS_CODES[err.status] };
      return;
    }

    logger.error({ err }, 'Unhandled error');
    ctx.status = 500;
    ctx.body = { message: 'Internal Server Error' };
  }
};
