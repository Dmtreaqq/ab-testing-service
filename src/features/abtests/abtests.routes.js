const { Router } = require('@koa/router');
const validate = require('../../middleware/validate');
const abtestsController = require('./abtests.controller');
const { abtestBodySchema } = require('./abtests.schema');

const router = new Router({ prefix: '/abtests' });

router.post('/', validate({ body: abtestBodySchema }), abtestsController.create);

module.exports = router;
