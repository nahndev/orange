-- CreateEnum
CREATE TYPE "CommitJobTrigger" AS ENUM ('SENTENCE_CHANGED');

-- CreateEnum
CREATE TYPE "CommitJobStatus" AS ENUM ('RUNNING', 'SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "commit_job_configs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dictionaryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trigger" "CommitJobTrigger" NOT NULL DEFAULT 'SENTENCE_CHANGED',
    "filePathTemplate" TEXT NOT NULL DEFAULT 'locales/{language}.json',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commit_job_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commit_jobs" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "status" "CommitJobStatus" NOT NULL DEFAULT 'RUNNING',
    "branch" TEXT,
    "commitSha" TEXT,
    "changeRequestNumber" INTEGER,
    "changeRequestUrl" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "commit_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "commit_job_configs_dictionaryId_trigger_enabled_idx" ON "commit_job_configs"("dictionaryId", "trigger", "enabled");

-- CreateIndex
CREATE INDEX "commit_jobs_configId_createdAt_idx" ON "commit_jobs"("configId", "createdAt");

-- AddForeignKey
ALTER TABLE "commit_job_configs" ADD CONSTRAINT "commit_job_configs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commit_job_configs" ADD CONSTRAINT "commit_job_configs_dictionaryId_fkey" FOREIGN KEY ("dictionaryId") REFERENCES "dictionaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commit_jobs" ADD CONSTRAINT "commit_jobs_configId_fkey" FOREIGN KEY ("configId") REFERENCES "commit_job_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
