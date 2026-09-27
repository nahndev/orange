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

export interface DictionaryDetail extends Dictionary {
  entries: DictionaryEntry[];
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
