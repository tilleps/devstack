import { Router } from "devstack/express";

export async function health(req, res, next) {
  const registry = req.app.get("registry");

  const healthCheck = registry.singleton("healthCheck");
  const healthCheckResults = await healthCheck.checkHealth();

  const isOperational = await healthCheck.isOperational(healthCheckResults);

  const items = healthCheckResults;

  res.json({
    status: isOperational ? "up" : "down",
    version: registry.get("config.version"),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    items
  });
}

export function live(req, res, next) {
  res.send("SERVER_IS_NOT_SHUTTING_DOWN");
}

export async function ready(req, res, next) {
  const registry = req.app.get("registry");
  const healthCheck = registry.singleton("healthCheck");

  const healthCheckResults = await healthCheck.checkHealth();
  const isOperational = await healthCheck.isOperational(healthCheckResults);

  if (isOperational) {
    res.status(200);
    res.send("SERVER_IS_READY");
    return;
  }

  res.status(500);
  res.send("SERVER_IS_NOT_READY");
}

function createRouter() {
  const router = Router({ strict: true });

  router.get("/health", health);
  router.get("/live", live);
  router.get("/ready", ready);

  return router;
}

export default createRouter;
