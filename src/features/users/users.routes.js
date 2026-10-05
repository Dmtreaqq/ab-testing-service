const { Router } = require('@koa/router');
const validate = require('../../middleware/validate');
const usersController = require('./users.controller');
const { idParamsSchema, userBodySchema } = require('./users.schema');

const router = new Router({ prefix: '/users' });

router.get('/', usersController.list);
router.get('/:id', validate({ params: idParamsSchema }), usersController.getById);
router.post('/', validate({ body: userBodySchema }), usersController.create);
router.put(
  '/:id',
  validate({ params: idParamsSchema, body: userBodySchema }),
  usersController.replace,
);
router.delete('/:id', validate({ params: idParamsSchema }), usersController.remove);

module.exports = router;
