/**
 * Data Source Name
 */
export default class DSN {
  #components;

  constructor(url) {
    try {
      this.#components = new URL(url);
    } catch (err) {
      throw new Error("Invalid URL");
    }
  }

  toJSON() {
    let components = this.#components;
    let searchParams = Object.fromEntries(components.searchParams.entries());

    let dsn = Object.assign(searchParams, {
      host: components.hostname,
      port: components.port,
      user: decodeURIComponent(components.username),
      password: decodeURIComponent(components.password),
      database: components.pathname.slice(1)
    });

    return dsn;
  }

  toString() {
    return this.#components.toString();
  }
}
