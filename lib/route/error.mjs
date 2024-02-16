import { randomUUID } from "crypto";
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

  // Set status code
  res.status(err.statusCode || 500);

  const logger = req.logger || req.app.get("logger");

  const env = req.app.get("env");

  let message = err.message;

  // Log the error
  if (err.statusCode < 500) {
    logger?.info(err, "ErrorHandler");
  } else {
    logger?.error(err, "ErrorHandler");

    // Overwrite messages for server errors
    //if (env !== "development") {
    //  message = "Internal server error";
    //}
  }

  const isDevelopmentMode = env === "development" && true;

  const response = {
    id: res.locals.requestId || randomUUID(),
    error: {
      reason: err.name,
      //message: message,
      message: isDevelopmentMode ? message : "Internal server error",
      //message: "Internal server error",
      stack: isDevelopmentMode ? err.stack : undefined
    }
  };

  if (cause) {
    response.error.cause = {
      reason: cause.name,
      message: cause.message,
      stack: isDevelopmentMode ? cause.stack : undefined
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
    // Remove error stack from JSON responses
    delete response.error.stack;

    res.json(response);
    return;
  }

  // Render template
  res.render("error", response);
}

function onlyAcceptsJSON(req) {
  return req.accepts("application/json") && !req.accepts("text/html");
}

export default errorHandler;
