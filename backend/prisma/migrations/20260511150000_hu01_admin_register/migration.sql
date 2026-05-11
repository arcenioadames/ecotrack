-- Rename password column to passwordHash and add updatedAt for user auditing
ALTER TABLE "User"
RENAME COLUMN "password" TO "passwordHash";

ALTER TABLE "User"
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;