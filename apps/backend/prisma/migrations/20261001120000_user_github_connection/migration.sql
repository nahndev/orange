-- AlterTable
ALTER TABLE "users" ADD COLUMN     "githubBranch" TEXT,
ADD COLUMN     "githubOwner" TEXT,
ADD COLUMN     "githubRepo" TEXT,
ADD COLUMN     "githubTokenEncrypted" TEXT;
