import net from "node:net";

export function normalizeIp(raw?: string | string[] | null): string | null {
  if (!raw) return null;

  let value = Array.isArray(raw) ? raw[0] : raw;
  value = String(value).trim();

  if (value.includes(",")) {
    value = value.split(",")[0].trim();
  }

  if (value.startsWith("::ffff:")) {
    value = value.replace("::ffff:", "");
  }

  if (net.isIP(value)) {
    return value;
  }

  return null;
}

export function getRequestIpFromHeaders(headers: Record<string, unknown>, directIp?: string | undefined): string | null {
  const forwarded = headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim().length > 0) {
    return normalizeIp(forwarded);
  }

  if (directIp) {
    return normalizeIp(directIp);
  }

  return null;
}

export default { normalizeIp, getRequestIpFromHeaders };
