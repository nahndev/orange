-- CreateTable
CREATE TABLE "github_profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "githubOwner" TEXT NOT NULL,
    "githubRepo" TEXT NOT NULL,
    "githubBranch" TEXT NOT NULL,
    "githubTokenEncrypted" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "github_profiles_pkey" PRIMARY KEY ("id")
);

-- Extract the GitHub connection of every user that has a complete one into a profile.
-- The profile reuses the user id, which keeps the relink of commit_job_configs below a plain copy.
INSERT INTO "github_profiles" ("id", "name", "githubOwner", "githubRepo", "githubBranch", "githubTokenEncrypted", "updatedAt")
SELECT "id", "githubOwner" || '/' || "githubRepo" || '@' || "githubBranch", "githubOwner", "githubRepo", "githubBranch", "githubTokenEncrypted", CURRENT_TIMESTAMP
FROM "users"
WHERE "githubOwner" IS NOT NULL
  AND "githubRepo" IS NOT NULL
  AND "githubBranch" IS NOT NULL
  AND "githubTokenEncrypted" IS NOT NULL;

-- AlterTable: link commit jobs to the profile instead of the user
ALTER TABLE "commit_job_configs" ADD COLUMN "connectorId" TEXT;

UPDATE "commit_job_configs"
SET "connectorId" = "userId"
WHERE "userId" IN (SELECT "id" FROM "github_profiles");

-- Configs of users without a complete connection could never push anywhere; drop them (their runs cascade).
DELETE FROM "commit_job_configs" WHERE "connectorId" IS NULL;

ALTER TABLE "commit_job_configs" ALTER COLUMN "connectorId" SET NOT NULL;

-- DropForeignKey
ALTER TABLE "commit_job_configs" DROP CONSTRAINT "commit_job_configs_userId_fkey";

-- AlterTable
ALTER TABLE "commit_job_configs" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "githubBranch",
DROP COLUMN "githubOwner",
DROP COLUMN "githubRepo",
DROP COLUMN "githubTokenEncrypted";

-- AddForeignKey
ALTER TABLE "commit_job_configs" ADD CONSTRAINT "commit_job_configs_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "github_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
