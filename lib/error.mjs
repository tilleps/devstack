/**
 * @typedef {Object} SimplifyStackOptions
 * @prop {boolean} [nodeModules]
 */

/**
 * @param {string} stack
 * @param {SimplifyStackOptions} options
 * @return {string}
 */
export function simplifyStack(stack, options = {}) {
  const lines = stack.split("\n");

  let filtered = lines;

  // Filter out node internals
  filtered = filtered.filter(function (line) {
    return !line.match(/node:internal/);
  });

  // Filter out any node_modules
  if (!options.nodeModules) {
    filtered = filtered.filter(function (line) {
      return !~line.search(/\/node_modules\//);
    });
  }

  return filtered.join("\n");
}
