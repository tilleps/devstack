/**
 * @param {string} stack
 * @return {string}
 */
export function simplifyStack(stack) {
  const lines = stack.split("\n");

  // Search for the first index that have node_modules directory
  const index = lines.findIndex(function (line) {
    return ~line.search(/\/node_modules\//);
  });

  // Slice off stack lines after node_modules start to appear
  return lines.slice(0, index).join("\n");
}
