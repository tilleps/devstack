import { promisify } from "node:util";
import passportHttpRequest from "passport/lib/http/request.js";
import UnauthorizedException from "devstack/exception/unauthorized";

/**
 * @param {string} [registryKey]
 */
export function initialize(registryKey = "passport") {
  /**
   * @type {import("express").RequestHandler}
   * @this {import("express").RequestHandler}
   */
  return function (req, res, next) {
    const registry = req.app.get("registry");
    const passport = registry.factory(registryKey);
    passport.initialize().apply(this, arguments);
  };
}

/**
 * @param {string} [registryKey]
 */
export function session(registryKey = "passport") {
  /**
   * @type {import("express").RequestHandler}
   * @this {import("express").RequestHandler}
   */
  return function (req, res, next) {
    const registry = req.app.get("registry");
    const passport = registry.factory(registryKey);
    passport.session().apply(this, arguments);
  };
}

export function preInitialize() {
  /**
   * @type {import("express").RequestHandler}
   */
  return function (req, res, next) {
    /**
     * Test if request is authenticated.
     *
     * @this {Record<string, any>}
     * @return {boolean}
     */
    req.isAuthenticated = function () {
      const property = this._userProperty || "user";
      return this[property] ? true : false;
    };

    /**
     * Example usage:
     *   logIn(user, { keepSessionInfo: true });
     *
     * @type {Function}
     * @param {Express.User} user
     * @param {import("passport").LogInOptions} options
     */
    req.logIn = promisify(passportHttpRequest.logIn);
    req.logOut = promisify(passportHttpRequest.logOut);

    next();
  };
}

/**
 * Authenticate
 * Passport authenticate wrapper that ensures error handling is consistent
 *
 * @param {string} registryKey
 * @param {string|Array.<string>} strategies
 * @param {string} [userProperty=user] Property "client" is already used by express
 */
export function authenticate(registryKey = "passport", strategies, userProperty = "user") {
  /**
   * @type {import("express").RequestHandler}
   * @this {import("express").RequestHandler}
   */
  return function (req, res, next) {
    const registry = req.app.get("registry");
    const passport = registry.singleton(registryKey);
    passport
      .authenticate(
        strategies,
        { session: false },

        /**
         * @param {Error} err
         * @param {Object.<string, any>} user
         * @param {Object.<string, any>} info
         */
        function (err, user, info) {
          if (err) {
            return next(err);
          }

          if (!user) {
            return next(new UnauthorizedException());
          }

          req[userProperty] = user;
          req.authInfo = info;

          next();
        }
      )
      .apply(this, arguments);
  };
}

/**
 * @param {import("devstack/collection")} collection
 */
export function getSigningKey(collection) {
  /**
   * @param {Object<string, any>} header
   * @param {Function} callback
   */
  return async function (header, callback) {
    const { kid } = header;
    try {
      let signingKey = await collection.findOneByUid(kid);
      callback(null, signingKey.private_key);
    } catch (err) {
      const cause = err instanceof Error ? err : undefined;
      return callback(new Error("Unable to get private key", { cause }));
    }
  };
}
