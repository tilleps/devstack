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

    const collection = new Collection();

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
import config from "../../config/dbs/mysql/primary.mjs";

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

  const collection = new Collection({
    adapter: mysqlAdapter
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
