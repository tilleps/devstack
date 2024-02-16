/* eslint-disable no-console */

import Collection from "./index.mjs";
import MysqlAdapter from "./adapter/mysql.mjs";

//*
//
//  @todo Convert to TAP tests
//
(async function () {
  try {
    let data = {
      name: "Bob",
      created: new Date()
    };

    const collection = new Collection({
      hydrator: function (row) {
        row.hydrated = true;
        return row;
      }
    });

    const test1 = await collection.create(data);
    console.log("test1", test1);

    const test2 = await collection.findOneById(test1.id);
    console.log("test2", test2);

    const test3 = await collection.updateById(test2.id, {
      uid: "example",
      updated: new Date()
    });
    console.log("test3", test3);

    const test4 = await collection.findOneByUid("example");
    console.log("test4", test4);

    const test5 = await collection.updateByUid("example", { updated: new Date() });
    console.log("test5", test5);

    const test6 = await collection.find();
    console.log("test6", test6);

    const test7 = await collection.deleteById(test6[0].id);
    console.log("test7", test7);

    const test8 = await collection.find();
    console.log("test8", test8);
  } catch (err) {
    console.error("Error", err);
  }
})();
//*/

import knex from "knex";

const config = {
  // "mysql" client throws "ER_NOT_SUPPORTED_AUTH_MODE", use "mysql2" instead
  client: "mysql2",
  acquireConnectionTimeout: 5000,
  pool: {
    propagateCreateError: true,
    min: 0,
    max: 10
  },
  connection: {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "test",
    charset: "utf8",
    multipleStatements: true,
    timezone: "+00:00"
  }
};

(async function () {
  /**
   * @type {import("knex").Knex}
   */
  const db = knex(config);

  //console.log("DB", db);

  const mysqlAdapter = new MysqlAdapter({
    knex: db,
    table: "example"
  });

  mysqlAdapter;

  const collection = new Collection({
    //adapter: mysqlAdapter
  });

  let data = {
    name: "Bob",
    created_dt: new Date()
  };
  const test1 = await collection.create(data);
  console.log("test1", test1);

  const test2 = await collection.findOneById(test1.id);
  console.log("test2", test2);

  const test3 = await collection.updateById(test2.id, {
    uid: "example",
    updated_dt: new Date()
  });
  console.log("test3", test3);

  const test4 = await collection.findOneByUid("example");
  console.log("test4", test4);

  const test5 = await collection.updateByUid("example", { name: "Joe", updated_dt: new Date() });
  console.log("test5", test5);

  const test6 = await collection.find();
  console.log("test6", test6);

  const test7 = await collection.deleteById(test6[0].id);
  console.log("test7", test7);
})();
