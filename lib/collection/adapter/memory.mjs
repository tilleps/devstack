import CollectionAdapter from "./index.mjs";

/**
 * @typedef {import("./index.mjs").AdapterOptions} AdapterOptions
 * @typedef {import("./index.mjs").FindOptions} FindOptions
 * @typedef {import("../index.mjs").CollectionItem} CollectionItem
 */

/**
 * @module MemoryAdapter
 * @extends CollectionAdapter
 */
export default class MemoryAdapter extends CollectionAdapter {
  /**
   * @type {AdapterOptions}
   */
  #options = {};

  /**
   * @type {Array.<object>} #items
   */
  #items = [];

  /**
   * @param {AdapterOptions} options
   */
  constructor(options = {}) {
    super();
    this.#options = options;
  }

  /**
   * @param {object} data
   * @return {Promise.<any>}
   */
  create(data) {
    return new Promise(
      /**
       * @this {MemoryAdapter}
       * @param {Function} resolve
       * @param {Function} reject
       */
      async function (resolve, reject) {
        if (typeof data !== "object") {
          return reject("invalid data");
        }

        // Generate ID if missing
        if (!("id" in data)) {
          let primaryKey = this.generatePrimaryKey();
          data = Object.assign(
            {
              id: primaryKey
            },
            data
          );
        }

        this.#items.push(data);
        return resolve(data);

        // Invalid object
        reject("unhandled");
      }.bind(this)
    );
  }

  /**
   * @param {number|string} id
   * @return {Promise.<any>}
   */
  deleteById(id) {
    return new Promise(
      /**
       * @this {MemoryAdapter}
       * @param {Function} resolve
       * @param {Function} reject
       */
      function (resolve, reject) {
        /**
         * @param {CollectionItem} item
         */
        function filter(item) {
          return item.id !== id;
        }

        this.#items = this.#items.filter(filter);

        resolve(true);
      }.bind(this)
    );
  }

  /**
   * @param {number|string} uid
   * @return {Promise.<any>}
   */
  deleteByUid(uid) {
    return new Promise(
      /**
       * @this {MemoryAdapter}
       * @param {Function} resolve
       * @param {Function} reject
       */
      function (resolve, reject) {
        /**
         * @param {CollectionItem} item
         */
        function filter(item) {
          return item.uid !== uid;
        }

        this.#items = this.#items.filter(filter);

        resolve(true);
      }.bind(this)
    );
  }

  /**
   * @param {FindOptions} [params]
   * @return {Promise.<any>}
   */
  find(params = {}) {
    return new Promise(
      /**
       * @this {MemoryAdapter}
       * @param {Function} resolve
       * @param {Function} reject
       */
      function (resolve, reject) {
        resolve(this.#items);
      }.bind(this)
    );
  }

  /**
   * @param {number|string} id
   * @return {Promise.<any>}
   */
  findOneById(id) {
    return new Promise(
      /**
       * @this {MemoryAdapter}
       * @param {Function} resolve
       * @param {Function} reject
       */
      function (resolve, reject) {
        /**
         * @param {CollectionItem} item
         */
        function filter(item) {
          return item.id === id;
        }
        resolve(this.#items.find(filter));
      }.bind(this)
    );
  }

  /**
   * @param {number|string} uid
   * @return {Promise.<any>}
   */
  findOneByUid(uid) {
    return new Promise(
      /**
       * @this {MemoryAdapter}
       * @param {Function} resolve
       * @param {Function} reject
       */
      function (resolve, reject) {
        /**
         * @param {CollectionItem} item
         */
        function filter(item) {
          return item.uid === uid;
        }
        resolve(this.#items.find(filter));
      }.bind(this)
    );
  }

  /**
   * @param {number|string} id
   * @param {object} data
   * @return {Promise.<any>}
   */
  updateById(id, data) {
    return new Promise(
      /**
       * @this {MemoryAdapter}
       * @param {Function} resolve
       * @param {Function} reject
       */
      async function (resolve, reject) {
        try {
          let item = await this.findOneById(id);

          if (!item) {
            reject("not-found");
            return;
          }

          item = Object.assign(item, data);

          resolve(item);
          return;
        } catch (err) {
          reject(err);
          return;
        }
      }.bind(this)
    );
  }

  /**
   * @param {number|string} uid
   * @param {object} data
   * @return {Promise.<any>}
   */
  updateByUid(uid, data) {
    return new Promise(
      /**
       * @this {MemoryAdapter}
       * @param {Function} resolve
       * @param {Function} reject
       */
      async function (resolve, reject) {
        try {
          let item = await this.findOneByUid(uid);

          if (!item) {
            reject("not-found");
            return;
          }

          item = Object.assign(item, data);

          resolve(item);
          return;
        } catch (err) {
          reject(err);
          return;
        }
      }.bind(this)
    );
  }
}
