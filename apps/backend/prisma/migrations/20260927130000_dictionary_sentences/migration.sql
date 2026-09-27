-- CreateTable
CREATE TABLE "dictionary_sentences" (
    "id" TEXT NOT NULL,
    "dictionaryId" TEXT NOT NULL,
    "values" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dictionary_sentences_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "dictionary_sentences" ADD CONSTRAINT "dictionary_sentences_dictionaryId_fkey" FOREIGN KEY ("dictionaryId") REFERENCES "dictionaries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
