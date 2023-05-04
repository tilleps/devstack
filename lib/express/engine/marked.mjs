import fs from "fs";
import marked from "marked";

/**
 * @todo caching
 */
export default function markdownEngine() {
  marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
  });

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

    fs.readFile(filePath, { encoding: "utf8" }, function (err, content) {
      if (err) {
        return callback(err);
      }

      const template = marked(content.toString());
      const rendered = render(template, options);

      cache[filePath] = template;

      callback(null, rendered);
    });
  };
}


/**
 *
 * @param {string} template
 * @param {Object.<string, string>} variables
 * @return {string}
 */
function render(template, variables) {
  /**
   * @param {string} match
   * @param {string} name
   * @return {string}
   */
  function replacer(match, name) {
    return variables[name] || "";
  }

  let rendered = template.replace(/\{\{([^}]+)\}\}/g, replacer);

  return rendered;
}
