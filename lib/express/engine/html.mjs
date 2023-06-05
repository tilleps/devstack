import fs from "fs";

/**
 * @todo caching
 */
export default function htmlEngine() {
  /**
   * @type {Object.<string, string>}
   */
  const cache = {};

  /**
   * @param {string} filePath
   * @param {Object.<string, string>} options
   * @param {function} callback
   */
  return function (filePath, options, callback) {
    if ("filePath" in cache) {
      const template = cache[filePath];

      callback(null, template);
      return;
    }

    fs.readFile(filePath, function (err, content) {
      if (err) {
        return callback(err);
      }

      const template = content.toString();

      cache[filePath] = template;

      return callback(null, template);
    });
  };
}
