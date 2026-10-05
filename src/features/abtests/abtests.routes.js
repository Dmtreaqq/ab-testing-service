const { Router } = require('@koa/router');
const validate = require('../../middleware/validate');
const abtestsController = require('./abtests.controller');
const { abtestBodySchema, variantParamsSchema, variantQuerySchema } = require('./abtests.schema');

const router = new Router({ prefix: '/abtests' });

router.get('/', abtestsController.list);
router.post('/', validate({ body: abtestBodySchema }), abtestsController.create);
router.get(
  '/:abTestId/variant',
  validate({ params: variantParamsSchema, query: variantQuerySchema }),
  abtestsController.getVariant,
);

module.exports = router;
