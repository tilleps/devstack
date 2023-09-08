import { promisify } from "node:util";
import passportHttpRequest from "passport/lib/http/request.js";

export function preInitialize() {
  return function (req, res, next) {
    /**
     * Test if request is authenticated.
     *
     * @return {Boolean}
     * @api public
     */
    req.isAuthenticated = function () {
      const property = this._userProperty || "user";
      return this[property] ? true : false;
    };

    req.logIn = promisify(passportHttpRequest.logIn);
    req.logOut = promisify(passportHttpRequest.logOut);

    next();
  };
}
