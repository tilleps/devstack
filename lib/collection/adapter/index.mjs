import { randomUUID } from "crypto";

/**
 * @typedef {object} AdapterOptions
 * @prop {object} [adapter]
 * @prop {number} [lastInsertId]
 */

/**
 * @typedef {import("../index.mjs").FindOptions} FindOptions
 */

export default class CollectionAdapter {
  /**
   * @type {AdapterOptions}
   */
  #options = {};

  /**
   * @param {AdapterOptions} options
   */
  constructor(options = {}) {
    this.#options = options;
  }

  /**
   * @return {string}
   */
  generatePrimaryKey() {
    if (typeof this.#options.lastInsertId === "number") {
      this.#options.lastInsertId++;
      return this.#options.lastInsertId.toString();
    }

    return randomUUID({ disableEntropyCache: true });
  }

  /**
   * @param {object} data
   * @return {Promise.<any>}
   */
  create(data) {
    return new Promise(function (resolve, reject) {
      reject(new Error("Not implemented: create()"));
    });
  }

  /**
   * @param {number|string} id
   * @return {Promise.<any>}
   */
  deleteById(id) {
    return new Promise(function (resolve, reject) {
      reject(new Error("Not implemented: deleteById()"));
    });
  }

  /**
   * @param {number|string} uid
   * @return {Promise.<any>}
   */
  deleteByUid(uid) {
    return new Promise(function (resolve, reject) {
      reject(new Error("Not implemented: deleteByUid()"));
    });
  }

  /**
   * @param {FindOptions} params
   * @return {Promise.<any>}
   */
  find(params = {}) {
    return new Promise(function (resolve, reject) {
      reject(new Error("Not implemented: find()"));
    });
  }

  /**
   * @param {number|string} id
   * @return {Promise.<any>}
   */
  findOneById(id) {
    return new Promise(function (resolve, reject) {
      reject(new Error("Not implemented: findOneById()"));
    });
  }

  /**
   * @param {number|string} uid
   * @return {Promise.<any>}
   */
  findOneByUid(uid) {
    return new Promise(function (resolve, reject) {
      reject(new Error("Not implemented: findOneByUid()"));
    });
  }

  /**
   * @param {number|string} id
   * @param {object} data
   * @return {Promise.<any>}
   */
  updateById(id, data) {
    return new Promise(function (resolve, reject) {
      reject(new Error("Not implemented: updateById()"));
    });
  }

  /**
   * @param {number|string} uid
   * @param {object} data
   * @return {Promise.<any>}
   */
  updateByUid(uid, data) {
    return new Promise(function (resolve, reject) {
      reject(new Error("Not implemented: updateByUid()"));
    });
  }
}
