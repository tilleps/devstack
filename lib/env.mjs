import DSN from "./dsn.mjs";

/**
 * @param {string} key
 * @param {Array<string>} [defaultValue]
 */
export function getArray(key, defaultValue) {
  let value = process.env[key];
  return typeof value === "string" ? value.split(",") : defaultValue;
}

/**
 * @param {string} key
 * @param {boolean} [defaultValue]
 * @return {boolean}
 */
export function getBoolean(key, defaultValue) {
  let value = process.env[key];

  if (typeof value === "string") {
    return String(value).toLowerCase() == "true" || parseInt(value) === 1;
  }

  return !!defaultValue;
}

/**
 * Get Data Source Name (DSN) / Database config
 *
 * mysql://user:password@localhost:8888/database?multipleStatements=1&timezone=%2B00%3A00&charset=utf8
 *
 * @param {string} key
 * @param {string} [defaultValue]
 * @return {Object<string, string>}
 */
export function getDSN(key, defaultValue) {
  let dsn;

  try {
    let connectionString = getString(key, defaultValue);

    dsn = new DSN(connectionString);
  } catch (err) {
    throw new Error(`Invalid DSN for ${key}`);
  }

  return dsn.toJSON();
}

/**
 * @param {string} key
 * @param {string} [defaultValue]
 * @return {string}
 */
export function getString(key, defaultValue) {
  let value = process.env[key];
  return typeof value === "string" ? value : String(defaultValue);
}

/**
 * @param {string} key
 * @param {number} defaultValue
 * @return {number}
 */
export function getInteger(key, defaultValue) {
  let value = process.env[key];
  return typeof value === "string" ? parseInt(value) : defaultValue;
}
