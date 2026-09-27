export interface RankableDictionarySentence {
  id: string;
  values: Record<string, string>;
  createdAt: string;
}

export interface SentenceSearchQuery {
  language?: string;
  query?: string;
  limit?: number;
}

export interface SentenceSearchInterface {
  indexSentence(dictionaryId: string, sentence: RankableDictionarySentence): Promise<void>;
  removeSentence(dictionaryId: string, sentenceId: string): Promise<void>;
  searchSentences(dictionaryId: string, query: SentenceSearchQuery): Promise<string[]>;
}

export const SENTENCE_SEARCH = Symbol("SENTENCE_SEARCH");
