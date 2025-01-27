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
  _options;

  /**
   * @type {import("knex").Knex}
   */
  _knex;

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

    this._knex = knex;

    if (!this._knex) {
      throw new Error("Knex instance required");
    }

    this._options = {
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

    if (!values[this._options.primaryKey] && this._options.primaryKeyType === "uuid") {
      values[this._options.primaryKey] = this.generatePrimaryKey();
    }

    let query = this._knex.insert(values).into(this._options.table);

    //console.log("toSQL", query.toSQL().toNative());
    //console.log("toSQL", query.toString());

    let result;
    let results = await query;
    let lastInsertId = results[0];

    if (lastInsertId) {
      result = await this.findOneById(lastInsertId);
      return result;
    }

    result = await this.findOneById(values[this._options.primaryKey]);

    return result;
  }

  /**
   *
   * @param {number|string} id
   * @return {Promise.<any>}
   */
  async deleteById(id) {
    let query = this._knex(this._options.table).where(this._options.primaryKey, "=", id).del();

    let result = await query;

    //  returns 1 if true
    //console.log("result", result);

    return result ? true : false;
  }

  /**
   *
   * @param {number|string} uid
   * @return {Promise.<any>}
   */
  async deleteByUid(uid) {
    let query = this._knex(this._options.table).where(this._options.uidKey, "=", uid).del();

    let result = await query;

    //  returns 1 if true
    //console.log("result", result);

    return result ? true : false;
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

    var query = this._knex(this._options.table);

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

    if (params.whereIn) {
      query = Object.entries(params.whereIn).reduce(function (query, [key, value]) {
        query.whereIn(key, value);
        return query;
      }, query);
    }

    if (params.whereNotIn) {
      query = Object.entries(params.whereNotIn).reduce(function (query, [key, value]) {
        query.whereNotIn(key, value);
        return query;
      }, query);
    }

    if (params.whereNull) {
      query = Object.values(
        Array.isArray(params.whereNull) ? params.whereNull : [params.whereNull]
      ).reduce(function (query, column) {
        query.whereNull(column);
        return query;
      }, query);
    }

    // Order By
    // Added support for strings (asc) and -strings (desc)
    // orderBy: "uid"
    // orderBy: ["-uid"],
    // orderBy: { column: "uid", order: "asc" },
    // orderBy: [{ column: "uid", order: "asc" }],
    if (params.orderBy) {
      if (typeof params.orderBy === "object" && params.orderBy.sql) {
        // Raw
        query.orderBy(params.orderBy);
      } else {
        const orderByArray = Array.isArray(params.orderBy) ? params.orderBy : [params.orderBy];

        const orderBy = orderByArray.reduce(function (ctx, item) {
          if (typeof item === "string") {
            if (item.substr(0, 1) === "-") {
              ctx.push({
                column: item.substr(1),
                order: "desc"
              });
            } else {
              ctx.push({
                column: item,
                order: "asc"
              });
            }
          }

          if (typeof item === "object") {
            ctx.push(item);
          }

          return ctx;
        }, []);

        query.orderBy(orderBy);
      }
    }

    if (params.orderByRaw) {
      query.orderByRaw(params.orderByRaw);
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

    let results = await query;

    return results.map(this._options.deserializer).filter(filter);
  }

  /**
   * @param {string} field
   * @param {number|string} value
   * @return {Promise.<any>}
   */
  async findOneBy(field, value) {
    let query = this._knex(this._options.table)
      //.first()
      .where(field, "=", value);

    let results = await query;

    let deserialized = results.map(this._options.deserializer);

    if (deserialized.length > 0) {
      return deserialized[0];
    }
  }

  /**
   * @param {number|string} id
   * @return {Promise.<any>}
   */
  async findOneById(id) {
    let query = this._knex(this._options.table)
      //.first()
      .where(this._options.primaryKey, "=", id);

    let results = await query;

    let deserialized = results.map(this._options.deserializer);

    if (deserialized.length > 0) {
      return deserialized[0];
    }
  }

  /**
   * @param {number|string} uid
   * @return {Promise.<any>}
   */
  async findOneByUid(uid) {
    let query = this._knex(this._options.table)
      //.first()
      .where(this._options.uidKey, "=", uid);

    let results = await query;

    let deserialized = results.map(this._options.deserializer);

    if (deserialized.length > 0) {
      return deserialized[0];
    }
  }

  /**
   * @param {number|string} id
   * @param {object} data
   * @return {Promise.<any>}
   */
  async updateById(id, data) {
    let values = Object.keys(data).reduce(_serializer, data);

    let query = this._knex(this._options.table)
      .where(this._options.primaryKey, "=", id)
      .update(values);

    let result = await query;
    //  returns 1 if success

    //console.log("RESULT", result);

    if (!result) {
      return false;
    }

    return await this.findOneById(id);
  }

  /**
   *
   * @param {number|string} uid
   * @param {object} data
   * @return {Promise.<any>}
   */
  async updateByUid(uid, data) {
    let values = Object.keys(data).reduce(_serializer, data);

    let query = this._knex(this._options.table)
      .where(this._options.uidKey, "=", uid)
      .update(values);

    let result = await query;
    //  returns 1 if success

    if (!result) {
      return false;
    }

    return await this.findOneByUid(uid);
  }

  /**
   * @param {string} id
   * @param {string} field
   * @param {string|array<string>} path
   * @param {string|boolean} [defaultValue]
   */
  async getJSONById(id, field, path, defaultValue = null) {
    path = Array.isArray(path) ? path : [path];
    path = path.map(JSON.stringify).join(".");

    const knex = this._knex;

    const query = this._knex(this._options.table)
      .select(
        knex.raw("JSON_EXTRACT(:field:, :path) AS value", {
          field: field,
          path: `$.${path}`
        })
      )
      .where(this._options.primaryKey, "=", id)
      .first();

    //console.log("QUERY", query.toString());

    const result = await query;

    if (result?.value) {
      return result?.value;
    }

    return defaultValue;
  }

  /**
   * @param {string} id
   * @param {string} field
   * @param {string|array<string>} path
   * @param {string|boolean} value
   * @return {boolean}
   */
  async setJSONById(id, field, path, value) {
    //  UPDATE `table` SET `field` = JSON_REPLACE(COALESCE(`field`, "{}"), '$.prop', CAST('value' AS JSON)) WHERE `id` = '0000'

    path = Array.isArray(path) ? path : [path];
    path = path.map(JSON.stringify).join(".");

    const knex = this._knex;

    const update = {};
    update[field] = knex.raw('JSON_SET(COALESCE(:field:, "{}"), :path, CAST(:value AS JSON))', {
      field: field,
      path: `$.${path}`,
      value: JSON.stringify(value)
    });

    const query = this._knex(this._options.table)
      .where(this._options.primaryKey, "=", id)
      .update(update);

    //console.log("QUERY", query.toString());

    const result = await query;

    return !!result;
  }

  /**
   * @param {string} id
   * @param {string} field
   * @param {string|array<string>} path
   * @return {boolean}
   */
  async unsetJSONById(id, field, path) {
    //  UPDATE `table` SET `field` = JSON_REMOVE(field, '$.prop') WHERE `id` = '0000'

    path = Array.isArray(path) ? path : [path];
    path = path.map(JSON.stringify).join(".");

    const knex = this._knex;

    const update = {};
    update[field] = knex.raw("JSON_REMOVE(:field:, :path)", {
      field: field,
      path: `$.${path}`
    });

    const query = this._knex(this._options.table)
      .where(this._options.primaryKey, "=", id)
      .update(update);

    const result = await query;

    return !!result;
  }

  /**
   * Add value to array
   *
   * @param {string} id
   * @param {string} field
   * @param {string|array<string>} path
   * @param {string|boolean} value
   * @return {boolean}
   */
  async addJSONById(id, field, path, value) {
    //  UPDATE `table`
    //  SET
    //    `field` = JSON_ARRAY_APPEND(
    //      JSON_SET(`field`, '$.prop',
    //        COALESCE(
    //          JSON_EXTRACT(`field`, '$.prop'),
    //          JSON_ARRAY()
    //        )
    //      ),
    //      '$.prop',
    //      'value'
    //    )
    //  WHERE `id` = '0000'

    path = Array.isArray(path) ? path : [path];
    path = path.map(JSON.stringify).join(".");

    const knex = this._knex;

    const update = {};
    update[field] = knex.raw(
      "JSON_ARRAY_APPEND( JSON_SET(:field:, :path, COALESCE( JSON_EXTRACT(:field:, :path), JSON_ARRAY() ) ), :path, CAST(:value AS JSON) )",
      {
        field: field,
        path: `$.${path}`,
        value: JSON.stringify(value)
      }
    );

    const query = this._knex(this._options.table)
      .where(this._options.primaryKey, "=", id)
      .update(update);

    //console.log(query.toString());

    const result = await query;

    return !!result;
  }

  /**
   * Remove a value from an array
   *
   * @param {string} id
   * @param {string} field
   * @param {string|array<string>} path
   * @param {string|boolean} value
   * @return {boolean}
   */
  async removeJSONById(id, field, path, value) {
    // UPDATE `table`
    // SET
    //   field =
    //     COALESCE(
    //       JSON_REMOVE(field, JSON_UNQUOTE(JSON_SEARCH(field, "one", "value", NULL, "$.prop"))),
    //       field
    //     )
    //  WHERE `user_id` = '0000'

    path = Array.isArray(path) ? path : [path];
    path = path.map(JSON.stringify).join(".");

    const knex = this._knex;

    const update = {};
    update[field] = knex.raw(
      'COALESCE(JSON_REMOVE(:field:, JSON_UNQUOTE(JSON_SEARCH(:field:, "one", :value, NULL, :path))), :field:)',
      {
        field: field,
        path: `$.${path}`,
        value: value
      }
    );

    const query = this._knex(this._options.table)
      .where(this._options.primaryKey, "=", id)
      .update(update);

    //console.log(query.toString());

    const result = await query;

    return !!result;
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
 * @param {CollectionItem} row
 * @return {CollectionItem|void}
 */
function _deserializer(row) {
  if (!row) {
    return;
  }

  return row;
}
