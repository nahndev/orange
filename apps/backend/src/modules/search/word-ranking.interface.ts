export interface DictionaryEntryDocument {
  id: string;
  key: string;
  description: string | null;
  values: Record<string, string>;
}

export interface WordRankingInterface {
  createIndex(dictionaryId: string): Promise<void>;
  deleteIndex(dictionaryId: string): Promise<void>;
  indexEntry(dictionaryId: string, entry: DictionaryEntryDocument): Promise<void>;
  removeEntry(dictionaryId: string, entryId: string): Promise<void>;
  findSimilarWords(dictionaryId: string, word: string, limit?: number): Promise<string[]>;
}

export const WORD_RANKING = Symbol("WORD_RANKING");
