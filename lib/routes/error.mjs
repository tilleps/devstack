import { simplifyStack } from "devstack/error";

/**
 * @type {import("express").ErrorRequestHandler}
 */
function errorHandler(err, req, res, next) {
  // Simplify the error stack
  if (err.stack) {
    err.stack = simplifyStack(err.stack);
  }

  //
  //  Add support for cause
  //
  let { cause } = err;

  if (cause && cause.stack) {
    cause.stack = simplifyStack(cause.stack);
  }

  // Log the error
  req.logger?.error(err);

  // Set status code
  res.status(err.statusCode || 500);

  // Render template
  res.render("error", {
    message: err.message,
    stack: err.stack,
    cause: cause
  });
}

export default errorHandler;
