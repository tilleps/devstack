import NotFoundError from "devstack/error/not-found";

/**
 * @type {import("express").RequestHandler}
 */
function notFound(req, res, next) {
  let msg = `Page not found: ${req.originalUrl}`;
  req.logger?.info?.(msg);

  throw new NotFoundError("Page not found");
}

export default notFound;
