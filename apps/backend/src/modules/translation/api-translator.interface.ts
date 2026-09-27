import type { DictionaryLanguage } from "@orange/shared-types";

export interface TranslateInput {
  text: string;
  languages: DictionaryLanguage[];
  context?: string;
}

export interface RelatedWordTranslation {
  key: string;
  values: Record<string, string>;
}

export interface GenerateContextInput {
  word: string;
  description?: string;
  languages: DictionaryLanguage[];
}

export interface GeneratedDictionaryContext {
  description: string;
  keywords: string[];
  relatedWords: RelatedWordTranslation[];
}

export interface ApiTranslatorInterface {
  translate(input: TranslateInput): Promise<Record<string, string>>;
  generateContext(input: GenerateContextInput): Promise<GeneratedDictionaryContext>;
}

export const API_TRANSLATOR = Symbol("API_TRANSLATOR");
