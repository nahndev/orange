import type { DictionaryLanguage } from "./dictionary";

export interface TranslateRequest {
  text: string;
  languages: DictionaryLanguage[];
  context?: string;
}

export type TranslateResult = Record<string, string>;
