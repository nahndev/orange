export interface RankableDictionaryEntry {
  id: string;
  key: string;
  description: string | null;
  values: Record<string, string>;
}

export interface WordRankingInterface {
  indexEntry(dictionaryId: string, entry: RankableDictionaryEntry): Promise<void>;
  removeEntry(dictionaryId: string, entryId: string): Promise<void>;
  findSimilarWords(dictionaryId: string, word: string, limit?: number): Promise<string[]>;
}

export const WORD_RANKING = Symbol("WORD_RANKING");
