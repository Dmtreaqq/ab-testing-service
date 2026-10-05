const { z } = require('zod');

const abtestBodySchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    dateStart: z.iso.datetime({ offset: true }),
    dateEnd: z.iso.datetime({ offset: true }),
    variantsCount: z.number().int().min(2).max(3),
  })
  .refine((data) => new Date(data.dateEnd) > new Date(data.dateStart), {
    message: 'dateEnd must be after dateStart',
    path: ['dateEnd'],
  });

const variantParamsSchema = z.object({
  abTestId: z.uuid(),
});

const variantQuerySchema = z.object({
  userId: z.uuid(),
});

module.exports = { abtestBodySchema, variantParamsSchema, variantQuerySchema };
