import type { RequestHandler } from "express";

type Bucket = {
  count: number;
  resetAt: number;
};

const requestBuckets = new Map<string, Bucket>();

function isHttpsRequest(req: Parameters<RequestHandler>[0]): boolean {
  const forwardedProto = req.header("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  return req.secure || forwardedProto === "https";
}

export const requireHttps: RequestHandler = (req, res, next) => {
  const enforceHttps = process.env.NODE_ENV === "production" || process.env.REQUIRE_HTTPS === "1";

  if (!enforceHttps) {
    return next();
  }

  if (isHttpsRequest(req)) {
    return next();
  }

  res.setHeader("Upgrade", "TLS/1.2, HTTPS");
  return res.status(426).json({
    message: "HTTPS requerido",
    details: "La conexión debe usar HTTPS/TLS 1.2 o superior.",
  });
};

export const basicApiProtection: RequestHandler = (req, res, next) => {
  if (process.env.NODE_ENV === "test") {
    return next();
  }

  const windowMs = Number(process.env.API_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000);
  const maxRequests = Number(process.env.API_RATE_LIMIT_MAX ?? 120);
  const routeKey = req.baseUrl || req.path || "/";
  const bucketKey = `${req.ip}:${routeKey}`;
  const now = Date.now();
  const bucket = requestBuckets.get(bucketKey);

  if (!bucket || bucket.resetAt <= now) {
    requestBuckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return next();
  }

  bucket.count += 1;
  if (bucket.count > maxRequests) {
    res.setHeader("Retry-After", String(Math.ceil((bucket.resetAt - now) / 1000)));
    return res.status(429).json({ message: "Too many requests" });
  }

  return next();
};

export default { requireHttps, basicApiProtection };