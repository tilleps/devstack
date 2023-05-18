/**
 *
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
 *
 * @param {string} key
 * @param {string} [defaultValue]
 * @return {string}
 */
export function getString(key, defaultValue) {
  let value = process.env[key];
  return typeof value === "string" ? value : String(defaultValue);
}

/**
 *
 * @param {string} key
 * @param {number} defaultValue
 * @return {number}
 */
export function getInteger(key, defaultValue) {
  let value = process.env[key];
  return typeof value === "string" ? parseInt(value) : defaultValue;
}
