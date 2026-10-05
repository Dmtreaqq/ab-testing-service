const { z } = require('zod');

const abtestBodySchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    active: z.boolean().default(false),
    dateStart: z.iso.datetime({ offset: true }),
    dateEnd: z.iso.datetime({ offset: true }),
  })
  .refine((data) => new Date(data.dateEnd) > new Date(data.dateStart), {
    message: 'dateEnd must be after dateStart',
    path: ['dateEnd'],
  });

module.exports = { abtestBodySchema };
