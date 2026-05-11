import { Client } from "pg";
import { execSync } from "node:child_process";
import { prisma } from "../../prisma/client";

const TEST_DB_URL = process.env.DATABASE_URL;
const DIRECT_DB_URL = process.env.DIRECT_URL;

function isSupabaseHost(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname.includes("supabase.com");
  } catch {
    return false;
  }
}

function isTestDbUrl(url: string | undefined): boolean {
  if (!url) return false;
  if (url.includes("ecotrack_test") || url.includes("_test")) return true;
  if (isSupabaseHost(url) && process.env.ECOTRACK_INTEGRATION_REMOTE_DB === "1") return true;
  return false;
}

function parsePostgresUrl(url: string): {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
} {
  const u = new URL(url);
  const host = u.hostname;
  const port = u.port ? Number(u.port) : 5432;
  const user = decodeURIComponent(u.username);
  const password = decodeURIComponent(u.password);
  const database = u.pathname.replace(/^\//, "");
  return { host, port, user, password, database };
}

async function ensureTestDatabaseExists(): Promise<void> {
  if (!TEST_DB_URL || !isTestDbUrl(TEST_DB_URL)) {
    throw new Error(
      `Refusing to run tests: DATABASE_URL does not look like a test database. Got: ${TEST_DB_URL ?? "undefined"}`,
    );
  }

  // Supabase: sin permisos CREATE DATABASE; migraciones vía DIRECT_URL
  if (isSupabaseHost(TEST_DB_URL)) {
    if (!DIRECT_DB_URL) {
      throw new Error("DIRECT_URL is required for Supabase (Prisma migrate uses directUrl).");
    }
    return;
  }

  const cfg = parsePostgresUrl(TEST_DB_URL);

  const adminClient = new Client({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: "postgres",
  });

  await adminClient.connect();
  try {
    const dbName = cfg.database.replace(/"/g, "\"");
    await adminClient.query(`CREATE DATABASE "${dbName}";`);
  } catch (err) {
    if (err instanceof Error && err.message.includes("42P04")) return;
    if (err instanceof Error && /already exists/i.test(err.message)) return;
    throw err;
  } finally {
    await adminClient.end();
  }
}

export async function setupTestDb(): Promise<void> {
  await ensureTestDatabaseExists();

  const directForMigrate = DIRECT_DB_URL ?? TEST_DB_URL;

  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: TEST_DB_URL,
      DIRECT_URL: directForMigrate,
    },
  });

  await prisma.$connect();
}

export async function cleanupTestDb(): Promise<void> {
  try {
    await prisma.user.deleteMany({});
  } finally {
    await prisma.$disconnect();
  }
}
