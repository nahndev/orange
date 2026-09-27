export interface DictionaryLanguage {
  key: string;
  country: string;
}

export type DictionaryEntryValues = Record<string, string>;

export interface DictionaryEntry {
  id: string;
  key: string;
  description: string | null;
  values: DictionaryEntryValues;
  createdAt: string;
  updatedAt: string;
}

export interface Dictionary {
  id: string;
  name: string;
  description: string | null;
  defaultLanguageKey: string | null;
  languages: DictionaryLanguage[];
  createdAt: string;
  updatedAt: string;
}

export interface DictionarySentence {
  id: string;
  values: DictionaryEntryValues;
  createdAt: string;
  updatedAt: string;
}

export interface DictionaryDetail extends Dictionary {
  entries: DictionaryEntry[];
  sentences: DictionarySentence[];
}

export interface CreateDictionaryRequest {
  name: string;
}

export interface UpdateDictionaryRequest {
  name?: string;
  description?: string;
  defaultLanguageKey?: string;
  languages?: DictionaryLanguage[];
}

export interface CreateDictionaryEntryRequest {
  key: string;
  description?: string;
  values: DictionaryEntryValues;
}

export interface UpdateDictionaryEntryRequest {
  key?: string;
  description?: string;
  values?: DictionaryEntryValues;
}

export interface CreateDictionarySentenceRequest {
  values: DictionaryEntryValues;
}

export interface UpdateDictionarySentenceRequest {
  values: DictionaryEntryValues;
}

export interface ListDictionarySentencesQuery {
  language?: string;
  q?: string;
}

export interface DictionaryRelatedWord {
  key: string;
  values: DictionaryEntryValues;
}

export interface DictionaryContext {
  description: string;
  keywords: string[];
  relatedWords: DictionaryRelatedWord[];
  createdAt: string;
  updatedAt: string;
}
