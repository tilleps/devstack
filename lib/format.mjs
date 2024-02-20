/**
 * @typedef {Object} convertBytesOptions
 * @prop {boolean} [useBinaryUnits]
 * @prop {number} [decimals]
 */

/**
 * @param {number} bytes
 * @param {convertBytesOptions} options
 * @return {string}
 */
export function convertBytes(bytes, options = {}) {
  const { useBinaryUnits = false, decimals = 2 } = options;

  if (decimals < 0) {
    throw new Error(`Invalid decimals ${decimals}`);
  }

  const base = useBinaryUnits ? 1024 : 1000;
  const units = useBinaryUnits
    ? ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]
    : ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(base));

  return `${(bytes / Math.pow(base, i)).toFixed(decimals)} ${units[i]}`;
}
