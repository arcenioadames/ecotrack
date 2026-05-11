ALTER TABLE "User"
ADD COLUMN "policyAcceptedIp" TEXT,
ADD COLUMN "anonymizedAt" TIMESTAMP(3),
ADD COLUMN "anonymizedReason" TEXT;

CREATE TABLE "PolicyAcceptanceAudit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL,
    "acceptedIp" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PolicyAcceptanceAudit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserAnonymizationAudit" (
    "id" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "anonymizedAt" TIMESTAMP(3) NOT NULL,
    "anonymizedIp" TEXT,
    "userAgent" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAnonymizationAudit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PolicyAcceptanceAudit_userId_acceptedAt_idx" ON "PolicyAcceptanceAudit"("userId", "acceptedAt");
CREATE INDEX "UserAnonymizationAudit_targetUserId_anonymizedAt_idx" ON "UserAnonymizationAudit"("targetUserId", "anonymizedAt");

ALTER TABLE "PolicyAcceptanceAudit"
ADD CONSTRAINT "PolicyAcceptanceAudit_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "UserAnonymizationAudit"
ADD CONSTRAINT "UserAnonymizationAudit_targetUserId_fkey"
FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "UserAnonymizationAudit"
ADD CONSTRAINT "UserAnonymizationAudit_actorUserId_fkey"
FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
