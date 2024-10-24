import { randomUUID } from "crypto";

export default function () {
  return [correlation(), childLogger(), requestLogger()];
}

export function correlation() {
  return function (req, res, next) {
    const requestId = req.get("x-request-id") || randomUUID();
    const correlationId = req.get("x-correlation-id") || requestId;

    res.locals.requestId = requestId;
    res.locals.correlationId = correlationId;

    next();
  };
}

export function childLogger() {
  return function (req, res, next) {
    const requestId = res.locals.requestId || req.get("x-request-id") || randomUUID();
    const correlationId = res.locals.correlationId || req.get("x-correlation-id") || requestId;

    const logger = req.app.get("logger");
    req.logger = logger?.child({
      requestId: requestId,
      correlationId: correlationId
    });
    next();
  };
}

export function requestLogger() {
  return function middleware(req, res, next) {
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

    const start = Date.now();

    res.on("finish", function () {
      const duration = (Date.now() - start) / 1000; // Convert to seconds

      req.logger?.info(
        {
          req: {
            method: req.method,
            url: req.originalUrl
          },
          res: {
            statusCode: res.statusCode,
            duration: duration,
            headers: {
              Location: res.get("Location")
            }
          }
        },
        "Response"
      );
    });

    next();
  };
}
