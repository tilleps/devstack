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

      const rendered = render(template, options);

      callback(null, rendered);
      return;
    }

    fs.readFile(filePath, function (err, content) {
      if (err) {
        return callback(err);
      }

      const template = content.toString();
      cache[filePath] = template;

      const rendered = render(template, options);

      callback(null, rendered);
      return;
    });
  };
}

const openDelimiter = "{{";
const closeDelimiter = "}}";

const regExp = new RegExp(`${openDelimiter}(\\w+)${closeDelimiter}`, "g");

function render(template, data) {
  const rendered = template.replace(regExp, function (match, key) {
    return data[key] || match;
  });

  return rendered;
}
