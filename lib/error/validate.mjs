class ValidateError extends Error {
  /**
   *
   * @param {string} message
   * @param {object} messages
   * @param {Error} [cause]
   */
  constructor(message, cause) {
    super(message, cause);
    this.name = "ValidateError";
    this.statusCode = 500;
  }
}

export default ValidateError;
