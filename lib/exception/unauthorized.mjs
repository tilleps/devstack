class UnauthorizedException extends Error {
  /**
   *
   * @param {string} message
   * @param {object} [options]
   */
  constructor(message = "Unauthorized", options) {
    super(message, options);
    this.name = "UnauthorizedException";
    this.statusCode = 401;
  }
}

export default UnauthorizedException;
