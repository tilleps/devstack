import Collection from "devstack/collection/index";

export default class ConfigCollection extends Collection {
  /**
   * @param {string} key
   * @param {any} defaultValue
   * @return {Promise<string|boolean|object|any[]>}
   */
  async get(key, defaultValue) {
    let result = await this.findOneByUid(key);

    if (!result) {
      return defaultValue;
    }

    return result.value;
  }

  /**
   * @param {string} key
   * @param {any} defaultValue
   * @return {Promise<string|boolean|object|any[]>}
   */
  async getCached(key, defaultValue) {
    let result = await this.findOneCachedByUid(key);

    if (!result) {
      return defaultValue;
    }

    return result.value;
  }
}
