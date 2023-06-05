import DSN from "./dsn.mjs";
import tap from "tap";

tap.test(function (t) {
  const connection =
    "mysql://user%23with%23hash:pass%23with%23hash@localhost:8888/database?multipleStatements=1&timezone=%2B00%3A00";
  const dsn = new DSN(connection);

  t.equal(typeof dsn, "object", "Should be object");

  t.equal(dsn.toString(), connection, "toString() should return to previous input");

  t.test("toJSON()", function (t) {
    const config = dsn.toJSON();

    t.equal(typeof config, "object", "Should be object");
    t.equal(config.host, "localhost", "Matching host");
    t.equal(config.port, "8888", "Matching port");
    t.equal(config.user, "user#with#hash", "Matching user");
    t.equal(config.password, "pass#with#hash", "Matching password");
    t.equal(config.database, "database", "Matching database");
    t.equal(config.timezone, "+00:00", "Matching extra parameter");

    t.end();
  });

  t.end();
});
