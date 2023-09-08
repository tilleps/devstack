class UnhandledError extends Error {
  /**
   *
   * @param {string} message
   * @param {Error} [cause]
   */
  constructor(message = "Unhandled error", cause) {
    super(message, cause);
    this.name = "UnhandledError";
    this.statusCode = 500;
  }
}

export default UnhandledError;
