-- CreateTable
CREATE TABLE "dictionary_contexts" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "keywords" JSONB NOT NULL DEFAULT '[]',
    "relatedWords" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dictionary_contexts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dictionary_contexts_entryId_key" ON "dictionary_contexts"("entryId");

-- AddForeignKey
ALTER TABLE "dictionary_contexts" ADD CONSTRAINT "dictionary_contexts_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "dictionary_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
