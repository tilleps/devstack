import http from "http";
import { createHttpTerminator } from "http-terminator";

/**
 * @typedef {object} ServerConfig
 * @prop {number} port
 * @prop {number} timeout
 * @prop {boolean} developMode
 */

/**
 * @param {import("express").Application} app
 * @param {ServerConfig} config
 * @param {import("pino").Logger} [logger]
 */
export default function server(app, config, logger) {
  const { port, developMode, timeout = 30000 } = config;

  const server = http.createServer(app);
  server.setTimeout(timeout);

  //
  //  Set Error Handler
  //
  server.on("error", function (err) {
    //  Log the error
    logger?.error(
      {
        event: "server-error",
        server: {
          port,
          timeout
        },
        err: err
      },
      "App failed to listen on port: %s",
      port
    );
  });

  //
  //  Set Teardown Handler
  //
  server.once("close", function () {
    // Trigger teardown
    // setImmediate allows the teardown logs to begin after the server logs
    setImmediate(function () {
      process.emit("teardown");
    });
  });

  /*
  //
  //  Socket.io
  //
  const io = socketio(server, {
    transports: ['websocket', 'polling'], // restrict on the client side
    serveClient: false
  });

  io.on("error", function(err) {
    logger?.fatal({
      event: "socketio-listen-fail",
      err: err
    }, "Server failed to listen");
  });

  //  Define allowed origins
  //io.origins(['https://foo.example.com:443']);
  //*/

  logger?.info(
    {
      server: {
        developMode: developMode,
        port: port
      }
    },
    "Startup"
  );

  /**
   * Listen / start on port
   */
  server.listen(
    port,
    /**
     * @param {Error} [err]
     */
    function (err) {
      if (err) {
        logger?.fatal(
          {
            event: "server-listen-fail",
            err: err,
            server: {
              port,
              timeout
            }
          },
          "Server failed to listen"
        );
        return;
      }

      const port = server.address().port;

      //  Log the listening port
      logger?.info(
        {
          event: "server-listen-success",
          node_env: process.env.NODE_ENV,
          node_version: process.version,
          server: {
            port,
            timeout
          }
        },
        "Server listening on port: %s",
        port
      );
    }
  );

  //
  //  Graceful shutdown
  //
  const httpTerminator = createHttpTerminator({ server });

  process.once("SIGTERM", gracefullyShutdown(httpTerminator, logger));
  process.once("SIGINT", gracefullyShutdown(httpTerminator, logger));

  return server;
}

/**
 * @param {number} milliseconds
 * @return {Promise}
 */
function delay(milliseconds) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, milliseconds);
  });
}

function gracefullyShutdown(httpTerminator, logger) {
  return async function () {
    logger?.info({}, "HTTP server terminating");

    // Prevent "connection refused" errors by adding a delay in ceasing to
    // accept new incoming requests
    await delay(3000);
    await httpTerminator.terminate();

    logger?.info({}, "HTTP server terminated");
  };
}
