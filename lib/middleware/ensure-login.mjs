/**
 * Ensure Login
 *
 * @param {string} loginUrl
 * @return {import("express").RequestHandler}
 */
export default function ensureLogin(loginUrl = "/login") {
  return function (req, res, next) {
    if (!req.isAuthenticated?.()) {
      // Store the current url to redirect later
      if (req.session) {
        req.session.returnTo = req.originalUrl || req.url;
      }

      res.redirect(loginUrl);
      return;
    }

    next();
  };
}
