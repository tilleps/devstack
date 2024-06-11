class UserInvalidException extends Error {
  /**
   *
   * @param {string} message
   * @param {Error} [cause]
   */
  constructor(message = "User is invalid", cause) {
    super(message, cause);
    this.name = "UserInvalidException";
    this.statusCode = 401;
  }
}

export default UserInvalidException;
