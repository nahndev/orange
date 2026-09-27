import type { DictionaryLanguage } from "@orange/shared-types";

export interface TranslateInput {
  text: string;
  languages: DictionaryLanguage[];
  context?: string;
}

export interface ApiTranslatorInterface {
  translate(input: TranslateInput): Promise<Record<string, string>>;
}

export const API_TRANSLATOR = Symbol("API_TRANSLATOR");
