/**
 * @param {string} stack
 * @return {string}
 */
export function simplifyStack(stack, options = {}) {
  const lines = stack.split("\n");

  //
  //  Filter for simple format
  //  "at {file}:{line}:{column}"
  //
  let filtered = lines.filter(function (line) {
    return line.match(/at\s[^\s]*:\d*:\d*/);
  });

  //
  //  Filter out Node internals
  //
  filtered = filtered.filter(function (line) {
    return !line.match(/at\snode:[^\s]*/);
  });

  //
  //  Filter out Node modules
  //
  const filterNodeModules = !!options?.nodeModules;

  if (filterNodeModules) {
    filtered = filtered.filter(function (line) {
      return ~line.search(/\/node_modules\//);
    });
  }

  return filtered.join("\n");
}
