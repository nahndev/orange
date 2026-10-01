import type { DictionaryLanguage } from "@orange/shared-types";

export interface TranslatePrompt {
  prompt: string;
  languages: DictionaryLanguage[];
}

export interface TranslateInput {
  prompts: TranslatePrompt[];
}

export interface ApiTranslatorInterface {
  translate(input: TranslateInput): Promise<Record<string, string>>;
}

export const API_TRANSLATOR = Symbol("API_TRANSLATOR");
