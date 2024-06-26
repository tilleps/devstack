class ServiceUnavailableException extends Error {
  /**
   *
   * @param {string} message
   * @param {object} [options]
   */
  constructor(message = "Service Unavailable", options) {
    super(message, options);
    this.name = "ServiceUnavailableException";
    this.statusCode = 503;
  }
}

export default ServiceUnavailableException;
