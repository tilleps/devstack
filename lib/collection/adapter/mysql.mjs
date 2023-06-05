import CollectionAdapter from "./index.mjs";

/**
 * @typedef {import("../index.mjs").CollectionItem} CollectionItem
 * @typedef {import("../index.mjs").FindOptions} FindOptions
 * @typedef {(value: object, index: number, array: object[]) => unknown | undefined} Deserializer
 */

/**
 *
 * @typedef {object} AdapterOptions
 * @prop {Deserializer} [deserializer]
 * @prop {string} [primaryKey]
 * @prop {string} [primaryKeyType]
 * @prop {string} [uidKey]
 * @prop {string} [table]
 * @prop {import("knex").Knex} knex
 * @prop {number} [lastInsertId]
 */

/**
 * @module MysqlAdapter
 * @extends CollectionAdapter
 */
export default class MysqlAdapter extends CollectionAdapter {
  /**
   * @typedef {object} MysqlAdapterOptions
   * @prop {Function} [deserializer]
   * @prop {string} [primaryKey]
   * @prop {string} [primaryKeyType]
   * @prop {string} [uidKey]
   * @prop {string} [table]
   * @prop {number} [lastInsertId]
   */
  #options;

  /**
   * @type {import("knex").Knex}
   */
  #knex;

  /**
   * @param {AdapterOptions} options
   */
  constructor(options) {
    super();

    const {
      deserializer = _deserializer,
      knex,
      primaryKeyType = "increment",
      primaryKey = "id",
      table = "table_name",
      uidKey = "uid"
    } = options;

    this.#knex = knex;

    if (!this.#knex) {
      throw new Error("Knex instance required");
    }

    this.#options = {
      deserializer,
      primaryKeyType,
      primaryKey,
      table,
      uidKey
    };
  }

  /**
   * @param {object} data
   * @return {Promise.<any>}
   */
  async create(data) {
    /**
     * TS7053
     *
     * @type {Object.<string, any>}
     */
    let values = Object.keys(data).reduce(_serializer, data);

    if (!values[this.#options.primaryKey] && this.#options.primaryKeyType === "uuid") {
      values[this.#options.primaryKey] = this.generatePrimaryKey();
    }

    let query = this.#knex.insert(values).into(this.#options.table);

    //console.log("toSQL", query.toSQL().toNative());
    //console.log("toSQL", query.toString());

    let results;
    let lastInsertId;

    let result;

    try {
      results = await query;
      lastInsertId = results[0];

      if (lastInsertId) {
        result = await this.findOneById(lastInsertId);
        return result;
      }

      result = await this.findOneById(values[this.#options.primaryKey]);

      return result;
    } catch (err) {
      throw err;
    }
  }

  /**
   *
   * @param {number|string} id
   * @return {Promise.<any>}
   */
  async deleteById(id) {
    var query = this.#knex(this.#options.table).where(this.#options.primaryKey, "=", id).del();

    let result;

    try {
      result = await query;

      //  returns 1 if true
      //console.log("result", result);

      return result ? true : false;
    } catch (err) {
      throw err;
    }
  }

  /**
   *
   * @param {number|string} uid
   * @return {Promise.<any>}
   */
  async deleteByUid(uid) {
    var query = this.#knex(this.#options.table).where(this.#options.uidKey, "=", uid).del();

    let result;

    try {
      result = await query;

      //  returns 1 if true
      //console.log("result", result);

      return result ? true : false;
    } catch (err) {
      throw err;
    }
  }

  /**
   *
   * @param {FindOptions} [params]
   * @return {Promise.<any>}
   */
  async find(params = {}) {
    params = params || {};

    var filter =
      typeof params.filter === "function"
        ? params.filter
        : function () {
            return true;
          };

    var query = this.#knex(this.#options.table);

    //console.log("toSQL", query.toSQL().toNative());

    //  Columns
    if (params.columns) {
      query = query.column(params.columns);
    }

    if (params.where) {
      query = query.where(params.where);
    }
    if (params.whereNot) {
      query = query.whereNot(params.whereNot);
    }

    if (params.orderBy) {
      //  Normalize OrderBy
      //  string to array
      //  add support for -column

      //query = query.orderBy(params.orderBy);

      let orderBy = Array.isArray(params.orderBy) ? params.orderBy : [params.orderBy];

      query = orderBy.reduce(function (ctx, item) {
        let column = item;
        let direction = "asc";

        if (typeof item === "string") {
          if (item.substr(0, 1) === "-") {
            column = item.substr(1);
            direction = "desc";
          }

          ctx.orderBy(column, direction);
        }

        //  Support for object does not appear to work
        //  { column: "", order: "" }

        return ctx;
      }, query);
    }

    if (params.limit) {
      query = query.limit(params.limit);
    }

    //
    //  Full-Text Search Support
    //
    if (params.search) {
      params.search = typeof params.search === "object" ? params.search : {};
      params.search.columns = Array.isArray(params.search.columns) ? params.search.columns : [];
      params.search.term = "term" in params.search ? String(params.search.term) : "";

      let bindings = [params.search.columns, params.search.term];

      //  @todo add support for boolean mode
      //  SELECT * FROM table_name WHERE MATCH(col1, col2, col3) AGAINST("searchTerm" IN NATURAL LANGUAGE MODE)
      if (params.search.term.length > 0) {
        query = query.whereRaw("MATCH(??) AGAINST(? IN NATURAL LANGUAGE MODE)", bindings);
      }
    }

    //console.log("toSQL", query.toSQL().toNative(), query.toSQL(), query.toString());

    let results;

    try {
      results = await query;

      return results.map(this.#options.deserializer).filter(filter);
    } catch (err) {
      throw err;
    }
  }

  /**
   * @param {number|string} id
   * @return {Promise.<any>}
   */
  async findOneById(id) {
    let query = this.#knex(this.#options.table)
      //.first()
      .where(this.#options.primaryKey, "=", id);

    let results;

    try {
      results = await query;
    } catch (err) {
      throw err;
    }

    try {
      let deserialized = results.map(this.#options.deserializer);

      if (deserialized.length > 0) {
        return deserialized[0];
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * @param {number|string} uid
   * @return {Promise.<any>}
   */
  async findOneByUid(uid) {
    let query = this.#knex(this.#options.table)
      //.first()
      .where(this.#options.uidKey, "=", uid);

    let results;

    try {
      results = await query;
    } catch (err) {
      throw err;
    }

    try {
      let deserialized = results.map(this.#options.deserializer);

      if (deserialized.length > 0) {
        return deserialized[0];
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * @param {number|string} id
   * @param {object} data
   * @return {Promise.<any>}
   */
  async updateById(id, data) {
    let values = Object.keys(data).reduce(_serializer, data);

    let query = this.#knex(this.#options.table)
      .where(this.#options.primaryKey, "=", id)
      .update(values);

    let result;

    try {
      result = await query;
      //  returns 1 if success

      //console.log("RESULT", result);

      if (!result) {
        return false;
      }

      return await this.findOneById(id);
    } catch (err) {
      throw err;
    }
  }

  /**
   *
   * @param {number|string} uid
   * @param {object} data
   * @return {Promise.<any>}
   */
  async updateByUid(uid, data) {
    let values = Object.keys(data).reduce(_serializer, data);

    let query = this.#knex(this.#options.table)
      .where(this.#options.uidKey, "=", uid)
      .update(values);

    let result;

    try {
      result = await query;
      //  returns 1 if success

      //console.log("RESULT", result);

      if (!result) {
        return false;
      }

      return await this.findOneByUid(uid);
    } catch (err) {
      throw err;
    }
  }
}

/**
 * @param {CollectionItem} ctx
 * @param {string} key
 * @return {CollectionItem}
 */
function _serializer(ctx, key) {
  //  Dates
  if (ctx[key] instanceof Date) {
    ctx[key] = ctx[key].toISOString();
  }

  //  Convert objects to JSON strings
  if (ctx[key] !== null && typeof ctx[key] === "object") {
    ctx[key] = JSON.stringify(ctx[key]);
  }

  //  Remove the trailing z from dates from keys that have certain suffixes
  //  Store in UTC value
  if (
    typeof ctx[key] === "string" &&
    (~["_dt"].indexOf(key.substr(-3)) || ~["_datetime"].indexOf(key.substr(-9)))
  ) {
    ctx[key] = new Date(ctx[key]).toISOString().replace("T", " ").substr(0, 19);
  }

  //  Convert booleans to integers
  if (typeof ctx[key] === "boolean") {
    ctx[key] = ctx[key] ? 1 : 0;
  }

  return ctx;
}

/**
 *

 * @param {CollectionItem} row
 * @return {CollectionItem|void}
 */
function _deserializer(row) {
  if (!row) {
    return;
  }

  return row;
}
