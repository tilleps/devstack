import { deprecate } from "node:util";

deprecate(() => {},
"'devstack/middleware/request-logger' deprecated, use 'devstack/middleware/logger' instead")();

export default function requestLoggerMiddleware() {
  return middleware;
}

function middleware(req, res, next) {
  req.logger?.info(
    {
      req: {
        method: req.method,
        url: req.originalUrl,
        headers: {
          host: req.headers.host,
          authorization: req.headers["authorization"] ? "[redacted]" : undefined,
          referer: req.headers.referer,
          "user-agent": req.headers["user-agent"],
          "x-request-id": req.headers["x-request-id"],
          "x-forwarded-for": req.headers["x-forwarded-for"]
        },
        ips: req.ips,
        ip: req.ip
      }
    },
    "Request"
  );

  res.on("finish", function () {
    req.logger?.info(
      {
        res: {
          statusCode: res.statusCode,
          headers: {
            Location: res.get("Location")
          }
        }
      },
      "Response"
    );
  });

  next();
}
