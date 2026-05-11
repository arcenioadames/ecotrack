import jwt from "jsonwebtoken";

export type Role = "ADMIN" | "STAFF"

export interface JwtPayload {
  sub: string // userId
  role: Role
  iat?: number
  exp?: number
}

function getEnvSecret(name: "ACCESS_TOKEN_SECRET" | "REFRESH_TOKEN_SECRET"): string {
  const v = process.env[name];
  if (!v) throw new Error(`Environment variable ${name} is required`);
  return v;
}

function signToken(payload: JwtPayload, secret: string, expiresIn: string): string {
  // jwt.sign accepts object payload
  return jwt.sign(payload as unknown as jwt.JwtPayload, secret as jwt.Secret, { expiresIn } as jwt.SignOptions);
}

function verifyToken(token: string, secret: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, secret);

    if (typeof decoded === "string" || !decoded || typeof decoded !== "object") {
      throw new Error("Invalid token payload");
    }

    // Validate minimal shape
    const { sub, role, iat, exp } = decoded as jwt.JwtPayload & Record<string, unknown>;

    if (typeof sub !== "string") throw new Error("Token payload missing sub");
    if (role !== "ADMIN" && role !== "STAFF") throw new Error("Token payload invalid role");

    return { sub, role: role as Role, iat: typeof iat === "number" ? iat : undefined, exp: typeof exp === "number" ? exp : undefined };
  } catch {
    throw new Error("Invalid or expired token");
  }
}

export function generateAccessToken(payload: JwtPayload): string {
  const secret = getEnvSecret("ACCESS_TOKEN_SECRET");
  return signToken(payload, secret, "1h");
}

export function generateRefreshToken(payload: JwtPayload): string {
  const secret = getEnvSecret("REFRESH_TOKEN_SECRET");
  return signToken(payload, secret, "7d");
}

export function verifyAccessToken(token: string): JwtPayload {
  const secret = getEnvSecret("ACCESS_TOKEN_SECRET");
  return verifyToken(token, secret);
}

export function verifyRefreshToken(token: string): JwtPayload {
  const secret = getEnvSecret("REFRESH_TOKEN_SECRET");
  return verifyToken(token, secret);
}

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};