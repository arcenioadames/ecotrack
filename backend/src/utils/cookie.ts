const REFRESH_COOKIE_NAME = "ecotrack_refresh_token";

export function parseCookieHeader(cookieHeader?: string | null): Record<string, string> {
  if (!cookieHeader) return {};

  return cookieHeader.split(";").reduce<Record<string, string>>((accumulator, part) => {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (!rawKey) return accumulator;
    accumulator[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue.join("="));
    return accumulator;
  }, {});
}

export function getRefreshTokenFromRequest(bodyToken?: unknown, cookieHeader?: string | null): string | null {
  if (typeof bodyToken === "string" && bodyToken.trim().length > 0) {
    return bodyToken.trim();
  }

  const cookies = parseCookieHeader(cookieHeader);
  return cookies[REFRESH_COOKIE_NAME] ?? null;
}

export function shouldUseRefreshCookie(): boolean {
  return process.env.REFRESH_TOKEN_COOKIE === "1" || process.env.NODE_ENV === "production";
}

export function buildRefreshCookie(value: string): string[] {
  const parts = [
    `${REFRESH_COOKIE_NAME}=${encodeURIComponent(value)}`,
    "HttpOnly",
    "Path=/auth",
    "SameSite=Strict",
  ];

  if (process.env.NODE_ENV === "production" || process.env.REFRESH_TOKEN_COOKIE_SECURE === "1") {
    parts.push("Secure");
  }

  const maxAgeSeconds = Number(process.env.REFRESH_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 7);
  parts.push(`Max-Age=${maxAgeSeconds}`);
  return parts;
}

export function buildClearRefreshCookie(): string[] {
  return [
    `${REFRESH_COOKIE_NAME}=`,
    "HttpOnly",
    "Path=/auth",
    "SameSite=Strict",
    "Max-Age=0",
  ];
}
