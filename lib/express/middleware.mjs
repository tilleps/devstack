/**
 * Middleware wrapper that catch uncaught errors
 *
 * @param {Function} middleware
 */
export function wrapper(middleware) {
  if (middleware.length === 4) {
    /**
     * @type {import("express").ErrorRequestHandler}
     */
    return async function (err, req, res, next) {
      try {
        await middleware(err, req, res, next);
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * @type {import("express").RequestHandler}
   */
  return async function (req, res, next) {
    try {
      await middleware(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}
