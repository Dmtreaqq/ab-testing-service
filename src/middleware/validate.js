const { ValidationError } = require('../lib/errors');

const SOURCES = {
  body: (ctx) => ctx.request.body,
  params: (ctx) => ctx.params,
  query: (ctx) => ctx.query,
};

// Usage: validate({ body: schema, params: schema, query: schema })
// Parsed values are exposed on ctx.state.validated.{body,params,query}.
module.exports = function validate(schemas) {
  return async function validateMiddleware(ctx, next) {
    const validated = {};
    const issues = [];

    for (const [source, schema] of Object.entries(schemas)) {
      const result = schema.safeParse(SOURCES[source](ctx));
      if (result.success) {
        validated[source] = result.data;
      } else {
        issues.push(
          ...result.error.issues.map((issue) => ({
            source,
            path: issue.path.join('.'),
            message: issue.message,
          })),
        );
      }
    }

    if (issues.length > 0) throw new ValidationError(issues);

    ctx.state.validated = validated;
    await next();
  };
};
