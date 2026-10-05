const pino = require('pino');
const config = require('../config');

module.exports = pino({
  level: config.logLevel,
  transport: config.env === 'production' ? undefined : { target: 'pino-pretty' },
});
