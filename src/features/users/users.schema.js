const { z } = require('zod');

const idParamsSchema = z.object({
  id: z.uuid(),
});

const userBodySchema = z.object({
  email: z.email().max(255),
  name: z.string().trim().min(1).max(255),
});

module.exports = { idParamsSchema, userBodySchema };
