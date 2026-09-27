-- CreateTable
CREATE TABLE "dictionaries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "defaultLanguageKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dictionaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dictionary_languages" (
    "id" TEXT NOT NULL,
    "dictionaryId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "country" TEXT NOT NULL,

    CONSTRAINT "dictionary_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dictionary_entries" (
    "id" TEXT NOT NULL,
    "dictionaryId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "values" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dictionary_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dictionary_languages_dictionaryId_key_key" ON "dictionary_languages"("dictionaryId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "dictionary_entries_dictionaryId_key_key" ON "dictionary_entries"("dictionaryId", "key");

-- AddForeignKey
ALTER TABLE "dictionary_languages" ADD CONSTRAINT "dictionary_languages_dictionaryId_fkey" FOREIGN KEY ("dictionaryId") REFERENCES "dictionaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dictionary_entries" ADD CONSTRAINT "dictionary_entries_dictionaryId_fkey" FOREIGN KEY ("dictionaryId") REFERENCES "dictionaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
