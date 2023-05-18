import url from "node:url";
import { readFile } from "node:fs/promises";

/**
 * Run Queries
 *
 * Supply an array of .sql filenames to load and run queries
 * contained within the files
 *
 * @param {string} workingPath
 * @param {Array<string>} files
 * @return {Function}
 */
export function runQueries(workingPath, files) {
  let __dirname = url.fileURLToPath(new URL(".", workingPath));

  let filePaths = files.map(function (file) {
    let filePath = `${__dirname}sql/${file}.sql`;
    return filePath;
  });

  /**
   * @param {import("knex").Knex} knex
   * @returns {Promise<any[]>}
   */
  return async function (knex) {
    let queries = [];
    for (let filePath of filePaths) {
      let content = await readFile(filePath, { encoding: "utf8" });
      let query = knex.raw(content);
      queries.push(query);
    }

    return Promise.all(queries);
  };
}
