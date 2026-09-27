-- DropForeignKey
ALTER TABLE "dictionary_contexts" DROP CONSTRAINT "dictionary_contexts_entryId_fkey";

-- DropTable
DROP TABLE "dictionary_contexts";

-- RenameTable
ALTER TABLE "dictionary_entries" RENAME TO "dictionary_terms";

-- RenameForeignKey
ALTER TABLE "dictionary_terms" RENAME CONSTRAINT "dictionary_entries_dictionaryId_fkey" TO "dictionary_terms_dictionaryId_fkey";

-- RenamePrimaryKey
ALTER TABLE "dictionary_terms" RENAME CONSTRAINT "dictionary_entries_pkey" TO "dictionary_terms_pkey";

-- RenameIndex
ALTER INDEX "dictionary_entries_dictionaryId_key_key" RENAME TO "dictionary_terms_dictionaryId_key_key";
