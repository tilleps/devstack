# Knex

## Stubs

Example configuration

```js
// ./config/dbs/mysql/example.mjs
/**
 * @type { import("knex").Knex.Config }
 */
{
  migrations: {
    directory: "./migrations/",
    tableName: "ConfigKnexMigration",
    stub: "../../../node_modules/devstack/lib/knex/migration.stub",
    loadExtensions: [".mjs"]
  },
  seeds: {
    directory: "./seeds/",
    stub: "../../../node_modules/devstack/lib/knex/seed.stub"
  }
}
```

Note: Ensure the stubs are relative to the config file
