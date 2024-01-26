import MemoryStore from "./adapter/memory.mjs";

function setHydrator(hydrator) {
  return function(row) {
    if (row) {
      return hydrator(row);
    }
  }
}

function defaultHydrator(row) {
  return row;
}

/**
 * @typedef {object} CollectionCache
 * @prop {Function} wrap
 * @prop {Function} del
 */

/**
 * @typedef {object} CollectionOptions
 * @prop {import("./adapter/index.mjs").default} [adapter]
 * @prop {CollectionCache} [cache]
 */

/**
 * @typedef {Object.<string, any>} CollectionItem
 * @prop {number|string} id
 * @prop {number|string} [uid]
 */

/**
 * @typedef {object} FindSearchOptions
 * @prop {Array<string>} [columns]
 * @prop {string} [term]
 */
/**
 * @typedef {object} FindOptions
 * @prop {FindSearchOptions} [search]
 * @prop {number} [limit]
 * @prop {Array<string>|string} [orderBy]
 * @prop {object} [where]
 * @prop {object} [whereNot]
 * @prop {Array<string>|object} [columns]
 * @prop {(value: unknown, index: number, array: unknown[]) => unknown} [filter]
 */
export default class Collection {
  _adapter;

  /**
   * @type {CollectionCache} _cache
   */
  _cache;

  /**
   * @type {Function} _hydrator
   */
  _hydrator;

  /**
   * @param {CollectionOptions} [options]
   */
  constructor(options = {}) {
    //
    //  Store / Adapter
    //
    if ("adapter" in options) {
      if (!options.adapter) {
        throw new Error("Invalid adapter");
      }

      this._adapter = options.adapter;
    } else {
      this._adapter = new MemoryStore();
    }

    //
    //  Hydrator
    //
    const hydrator = options?.hydrator ? options.hydrator : defaultHydrator;

    if (typeof hydrator !== "function") {
      throw new Error("Invalid hydrator");
    }
    this._hydrator = setHydrator(hydrator);

    //
    //  Cache
    //
    this._cache = {
      /**
       * @param {string} cacheKey
       * @param {Function} cb
       */
      wrap: function (cacheKey, cb) {
        return cb();
      },
      /**
       * @param {string} cacheKey
       */
      del: function (cacheKey) {}
    };

    if ("cache" in options && typeof options.cache === "object") {
      this._cache = options.cache;
    }
  }

  /**
   *
   * @param {object} data
   */
  create(data) {
    return this._adapter.create(data).then(this._hydrator);
  }

  /**
   *
   * @param {number|string} id
   */
  deleteById(id) {
    let result = this._adapter.deleteById(id);

    let cacheKey = `id-${id}`;
    this._cache.del(cacheKey);

    return result;
  }

  /**
   *
   * @param {number|string} uid
   */
  deleteByUid(uid) {
    let result = this._adapter.deleteByUid(uid);

    let cacheKey = `uid-${uid}`;
    this._cache.del(cacheKey);

    return result;
  }

  /**
   *
   * @param {FindOptions} [params]
   * @return {Promise.<any>}
   */
  find(params = {}) {
    return this._adapter.find(params).then((rows) => rows.map(this._hydrator));
  }

  /**
   *
   * @param {number|string} id
   */
  findOneById(id) {
    return this._adapter.findOneById(id).then(this._hydrator);
  }

  /**
   *
   * @param {number|string} id
   */
  findOneCachedById(id) {
    let cacheKey = `id-${id}`;

    return this._cache.wrap(
      cacheKey,
      /**
       * @this {Collection}
       */
      function () {
        return this._adapter.findOneById(id);
      }.bind(this)
    );
  }

  /**
   *
   * @param {number|string} id
   */
  findOneByUid(id) {
    return this._adapter.findOneByUid(id).then(this._hydrator);
  }

  /**
   *
   * @param {number|string} uid
   */
  findOneCachedByUid(uid) {
    let cacheKey = `uid-${uid}`;

    return this._cache.wrap(
      cacheKey,
      /**
       * @this {Collection}
       */
      function () {
        return this.findOneByUid(uid);
      }.bind(this)
    );
  }

  /**
   *
   * @param {number|string} id
   * @param {object} data
   */
  updateById(id, data) {
    let cacheKey = `id-${id}`;
    this._cache.del(cacheKey);

    return this._adapter.updateById(id, data).then(this._hydrator);
  }

  /**
   *
   * @param {number|string} uid
   * @param {object} data
   */
  updateByUid(uid, data) {
    let cacheKey = `uid-${uid}`;
    this._cache.del(cacheKey);

    return this._adapter.updateByUid(uid, data).then(this._hydrator);
  }
}
