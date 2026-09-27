export interface DictionarySentenceDocument {
  id: string;
  values: Record<string, string>;
  createdAt: string;
}

export interface SentenceSearchQuery {
  language?: string;
  query?: string;
  limit?: number;
}

export interface SimilarDictionarySentence {
  id: string;
  values: Record<string, string>;
}

export interface SentenceSearchInterface {
  createIndex(dictionaryId: string): Promise<void>;
  deleteIndex(dictionaryId: string): Promise<void>;
  indexSentence(dictionaryId: string, sentence: DictionarySentenceDocument): Promise<void>;
  removeSentence(dictionaryId: string, sentenceId: string): Promise<void>;
  searchSentences(dictionaryId: string, query: SentenceSearchQuery): Promise<string[]>;
  findSimilarSentences(dictionaryId: string, text: string, limit: number): Promise<SimilarDictionarySentence[]>;
}

export const SENTENCE_SEARCH = Symbol("SENTENCE_SEARCH");
