import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "DATABASE_URL",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
];

const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]?.trim());
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
}

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
}

if (!process.env.CORS_ORIGIN && process.env.NODE_ENV !== "production") {
  process.env.CORS_ORIGIN = "http://localhost:19006,http://127.0.0.1:19006";
  console.warn("CORS_ORIGIN no definido. Usando orígenes de desarrollo locales solo para Expo web.");
}
