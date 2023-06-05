import http from "http";

/**
 * @typedef {object} ServerConfig
 * @prop {number} port
 * @prop {number} timeout
 * @prop {boolean} developMode
 */

/**
 *
 * @param {import("express").Application} app
 * @param {ServerConfig} config
 * @param {import("pino").Logger} [logger]
 */
export default function server(app, config, logger) {
  const { port, developMode, timeout = 30000 } = config;

  const server = http.createServer(app);
  server.setTimeout(timeout);

  //
  //  Set error handler
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

  return server;
}
