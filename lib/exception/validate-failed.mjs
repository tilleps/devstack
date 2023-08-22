class ValidateFailedException extends Error {
  /**
   *
   * @param {string} message
   * @param {object} messages
   * @param {Error} [cause]
   */
  constructor(message = "Validation failed", messages, cause) {
    super(message, cause);
    this.name = "ValidateFailedException";
    this.statusCode = 400;
    this.messages = messages;
  }
}

export default ValidateFailedException;
