class InternalError extends Error {
  /**
   *
   * @param {string} message
   * @param {Error} [cause]
   */
  constructor(message, cause) {
    super(message, cause);
    this.name = "InternalError";
    this.statusCode = 500;
  }
}

export default InternalError;
