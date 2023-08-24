import { simplifyStack } from "devstack/error";
import ValidateFailedException from "devstack/exception/validate-failed";

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

  const response = {
    error: {
      reason: err.name,
      message: err.message,
      stack: err.stack
    }
  };

  if (cause) {
    response.error.cause = {
      reason: cause.name,
      message: cause.message,
      stack: cause.stack
    };
  }

  //
  // Validate support
  // Add messages to response
  //
  if (err instanceof ValidateFailedException) {
    response.error.messages = err.messages;
  }

  if (req.is("application/json") || onlyAcceptsJSON(req)) {
    res.json(response);
    return;
  }

  // Render template
  res.render("error", response.error);
}

function onlyAcceptsJSON(req) {
  return req.accepts("application/json") && !req.accepts("text/html");
}

export default errorHandler;
