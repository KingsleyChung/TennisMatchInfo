module.exports = () => {
    return async (ctx, next) => {
      ctx.params = {};
      if (ctx.request.body) {
        Object.assign(ctx.params, ctx.request.body);
      }
      if (ctx.params) {
        Object.assign(ctx.params, ctx.params);
      }
      if (ctx.request.query) {
        Object.assign(ctx.params, ctx.request.query);
      }
      await next();
    }
  }