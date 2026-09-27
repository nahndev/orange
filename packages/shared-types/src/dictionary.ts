export interface DictionaryLanguage {
  key: string;
  country: string;
}

export type DictionaryTermValues = Record<string, string>;

export interface DictionaryTerm {
  id: string;
  key: string;
  description: string | null;
  values: DictionaryTermValues;
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
  values: DictionaryTermValues;
  createdAt: string;
  updatedAt: string;
}

export interface DictionaryDetail extends Dictionary {
  terms: DictionaryTerm[];
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

export interface CreateDictionaryTermRequest {
  key: string;
  description?: string;
  values: DictionaryTermValues;
}

export interface UpdateDictionaryTermRequest {
  key?: string;
  description?: string;
  values?: DictionaryTermValues;
}

export interface CreateDictionarySentenceRequest {
  values: DictionaryTermValues;
}

export interface UpdateDictionarySentenceRequest {
  values: DictionaryTermValues;
}

export interface ListDictionarySentencesQuery {
  language?: string;
  q?: string;
}

export interface TranslateDictionarySentenceRequest {
  text: string;
  languages: DictionaryLanguage[];
}

export type TranslateDictionarySentenceResult = Record<string, string>;
