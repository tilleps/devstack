//
//  Health Check
//
//  https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-probes
//
//  If your app has a strict dependency on back-end services, you can implement
//  both a liveness and a readiness probe. The liveness probe passes when the app
//  itself is healthy, but the readiness probe additionally checks that each
//  required back-end service is available.

/*
```mermaid
stateDiagram-v2
    direction LR

    init: <center>INIT</center>500 SERVER_IS_NOT_READY<br>500 SERVER_IS_NOT_SHUTTING_DOWN<br>500 SERVER_IS_NOT_READY
    ready: <center>READY</center>200 SERVER_IS_READY<br>200 SERVER_IS_NOT_SHUTTING_DOWN<br>200 SERVER_IS_READY
    degraded: <center>DEGRADED</center>200 SERVER_IS_NOT_READY<br>200 SERVER_IS_NOT_SHUTTING_DOWN<br>500 SERVER_IS_READY
    down: <center>DOWN</center>200 SERVER_IS_NOT_READY<br>200 SERVER_IS_NOT_SHUTTING_DOWN<br>500 SERVER_IS_NOT_READY
    closing: <center>CLOSING</center>200 SERVER_IS_READY<br>500 SERVER_IS_SHUTTING_DOWN<br>200 SERVER_IS_READY
    closed: <center>CLOSED</center>500 SERVER_IS_NOT_READY<br>500 SERVER_IS_SHUTTING_DOWN<br>500 SERVER_IS_NOT_READY

[*] --> init
init --> ready : await initialize()<br>server.listen()
ready --> closing : await server.close()
ready --> degraded : failed dependency
degraded --> down: failed dependency
degraded --> ready : healthy dependency
down --> degraded: healthy dependency
closing --> closed: await closed()<br>server.once("close")
closed --> [*] : await teardown()<br>proces.exit()
```
*/

const knexCallbacks = {
  /**
   * @param {import("knex").Knex} db
   */
  health: function knexHealthCallback(db) {
    return async function () {
      try {
        const sql = db.raw("SELECT 1 AS healthcheck");

        const result = await sql;

        return result?.[0]?.[0]?.healthcheck;
      } catch (err) {
        // Treat disconnects as false (instead of error)
        //if (err instanceof Error) {
        //  if (err.code === "ECONNREFUSED") {
        //    return false;
        //  }
        //}

        if (err instanceof Error && err.code === "ECONNREFUSED") {
          return false;
        }

        throw err;
      }
    };
  },
  /**
   * @param {import("knex").Knex} db
   */
  teardown: function knexTeardownCallback(db) {
    return async function () {
      // Destroy the connection regardless
      // Does not return any information upon success or failure
      await db.destroy();

      return true;
    };
  }
};

/**
 * @typedef {Object} HealthCheckDependency
 * @prop {string} [name]
 * @prop {boolean} [essential]
 * @prop {Function} [health]
 * @prop {Function} [teardown]
 */

/**
 * @typedef {Object} HealthCheckResult
 * @prop {Error} [error]
 * @prop {string} [name]
 * @prop {string} state
 * @prop {number} time
 * @prop {boolean} [essential]
 */

class HealthCheck {
  /**
   * @type {Array<HealthCheckDependency>}
   */
  _dependencies = [];

  callbacks = {
    knex: knexCallbacks
  };

  constructor() {}

  /**
   * @param {HealthCheckDependency} dependency
   */
  async add(dependency) {
    this._dependencies.push(dependency);
  }

  /**
   * @param {Array.<HealthCheckResult>} [healthCheckResults]
   * @return {Promise<boolean>}
   */
  async isOperational(healthCheckResults) {
    if (!healthCheckResults) {
      healthCheckResults = await this.checkHealth();
    }

    const notUpCount = healthCheckResults.reduce(function (count, HealthCheckResult) {
      const { state, essential } = HealthCheckResult;

      if (essential && state !== "up") {
        count++;
      }

      return count;
    }, 0);

    if (notUpCount === 0) {
      return true;
    }

    return false;
  }

  async getHealths() {
    const healthChecks = [];
    for (const dependency of this._dependencies) {
      if (typeof dependency.health !== "function") {
        continue;
      }

      const healthCheck = new Promise(async function (resolve, reject) {
        const name = dependency.name || null;
        const essential = dependency.hasOwnProperty("essential") ? !!dependency.essential : true;

        const start = process.hrtime.bigint();
        const timer = setTimeout(function () {
          resolve([null, name, "timeout", calculateDurationMilliseconds(start), essential]);
        }, 10000);

        try {
          let result = await dependency.health?.();
          if (!!result) {
            resolve([null, name, "up", calculateDurationMilliseconds(start), essential]);
          } else {
            resolve([null, name, "down", calculateDurationMilliseconds(start), essential]);
          }
        } catch (err) {
          resolve([err, name, "error", calculateDurationMilliseconds(start), essential]);
        }
        clearTimeout(timer);
      });

      healthChecks.push(healthCheck);
    }

    return healthChecks;
  }

  async getTeardowns() {
    const teardowns = [];

    for (const dependency of this._dependencies) {
      if (!dependency.teardown) {
        continue;
      }

      const teardown = new Promise(async function (resolve, reject) {
        const name = dependency.name || null;

        const start = process.hrtime.bigint();
        const timer = setTimeout(function () {
          resolve([null, name, "timeout", calculateDurationMilliseconds(start)]);
        }, 30000);

        try {
          let result = await dependency.teardown?.();
          if (!!result) {
            resolve([null, name, "success", calculateDurationMilliseconds(start)]);
          } else {
            resolve([null, name, "failure", calculateDurationMilliseconds(start)]);
          }
        } catch (err) {
          resolve([err, name, "error", calculateDurationMilliseconds(start)]);
        }
        clearTimeout(timer);
      });

      // LIFO - Last In First Out
      teardowns.unshift(teardown);
    }

    return teardowns;
  }

  /**
   * @return {Promise<Array.<HealthCheckResult>>}
   */
  async checkHealth() {
    const result = await Promise.allSettled(await this.getHealths());

    const healthCheckResults = result.map(function (x) {
      if (x.status === "fulfilled") {
        return x.value;
      }
      if (x.status === "rejected") {
        return x.reason;
      }
      return [new Error("Unhandled Promise.allSettled() status")];
    });

    // Formatted
    return healthCheckResults.map(function (result) {
      return {
        name: result[1],
        state: result[2],
        time: result[3],
        essential: result[4],
        error: result[0]
      };
    });
  }

  /**
   * Teardown
   *
   * Run all dependency teardowns
   */
  async teardown() {
    const results = await Promise.all(await this.getTeardowns());

    return results.map(function (result) {
      return {
        name: result[1],
        result: result[2],
        time: result[3],
        error: result[0]
      };
    });
  }
}

export default HealthCheck;

/**
 * @param {bigint} start
 * @return {number} Milliseconds
 */
function calculateDurationMilliseconds(start) {
  const hrtime = process.hrtime.bigint() - start;
  return Math.floor(Number(hrtime) / 1e6);
}
