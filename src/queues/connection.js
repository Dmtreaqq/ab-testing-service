const config = require('../config');

const base = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
};

// Producers fail fast when Redis is down so HTTP requests don't hang.
const producerConnection = { ...base, enableOfflineQueue: false };

// Workers use blocking commands and must retry indefinitely.
const workerConnection = { ...base, maxRetriesPerRequest: null };

module.exports = { producerConnection, workerConnection };
