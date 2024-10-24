import { readFileSync } from "node:fs";

/**
 * @param {string} path Path to the package.json file
 * @return {string}
 */
export function readJSONSync(path = "./package.json") {
  return JSON.parse(readFileSync(path));
}
