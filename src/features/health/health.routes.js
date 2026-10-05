const { Router } = require('@koa/router');
const db = require('../../db/knex');
const logger = require('../../lib/logger');

const router = new Router();

router.get('/health', async (ctx) => {
  try {
    await db.raw('select 1');
    ctx.body = { status: 'ok', db: 'up' };
  } catch (err) {
    logger.warn({ err }, 'Health check: database unreachable');
    ctx.status = 503;
    ctx.body = { status: 'error', db: 'down' };
  }
});

module.exports = router;
