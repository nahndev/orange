import { Inject, Injectable, Logger } from "@nestjs/common";
import type {
  DictionaryLanguage,
  DictionaryTermValues,
} from "@orange/shared-types";
import type { DictionaryTerm as DictionaryTermRecord } from "@prisma/client";
import type { SentenceSearchInterface } from "../search/sentence-search.interface";
import { SENTENCE_SEARCH } from "../search/sentence-search.interface";
import type { TranslatePrompt } from "../translation/api-translator.interface";

const SIMILAR_SENTENCE_LIMIT = 5;
const MAX_DESCRIPTION_LENGTH = 2000;

export interface DictionaryPromptTermRule {
  translations: DictionaryTermValues;
  meaning?: string;
}

export interface DictionaryPromptInput {
  text: string;
  languages: DictionaryLanguage[];
  terms: DictionaryPromptTermRule[];
  description?: string;
  similarSentences: DictionaryTermValues[];
}

export interface DictionaryPromptSource {
  description: string | null;
  terms: DictionaryTermRecord[];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatLanguageValues(values: DictionaryTermValues): string {
  return Object.entries(values)
    .map(([lang, value]) => `${lang}=${value}`)
    .join(", ");
}

@Injectable()
export class DictionaryPromptService {
  private readonly logger = new Logger(DictionaryPromptService.name);

  constructor(
    @Inject(SENTENCE_SEARCH)
    private readonly sentenceSearch: SentenceSearchInterface,
  ) {}

  async buildTranslationPrompts(
    dictionaryId: string,
    dictionary: DictionaryPromptSource,
    text: string,
    languages: DictionaryLanguage[],
  ): Promise<TranslatePrompt[]> {
    const similarSentences = await this.findSimilarSentences(
      dictionaryId,
      text,
    );

    return [
      this.renderPrompt({
        text,
        languages,
        terms: this.findTermRules(dictionary.terms, text),
        description:
          dictionary.description?.trim().slice(0, MAX_DESCRIPTION_LENGTH) ||
          undefined,
        similarSentences,
      }),
    ];
  }

  // The model decides whether a term applies: each term carries its meaning and
  // is only used when the text uses the word in that same meaning.
  renderPrompt(input: DictionaryPromptInput): TranslatePrompt {
    const languageKeys = input.languages.map((language) => language.key);
    const outputShape = `{${languageKeys.map((key) => `"${key}": "..."`).join(", ")}}`;

    const termLines = input.terms.map(({ translations, meaning }) => {
      const line = formatLanguageValues(translations);
      return meaning ? `${line} (meaning: ${meaning})` : line;
    });

    const prompt = [
      `Text: "${input.text}"`,
      `Translate to: ${languageKeys.join(", ")}`,
      input.description ? `Context: ${input.description}` : undefined,
      ...(termLines.length > 0
        ? ["Terminology MUST USING IF SAME MEAN", ...termLines]
        : []),
      ...(input.similarSentences.length > 0
        ? ["Example:", ...input.similarSentences.map(formatLanguageValues)]
        : []),
      `Output JSON only: ${outputShape}`,
    ]
      .filter((line): line is string => Boolean(line))
      .join("\n");

    return { prompt, languages: input.languages };
  }

  private findTermRules(
    terms: DictionaryTermRecord[],
    text: string,
  ): DictionaryPromptTermRule[] {
    return terms.flatMap((term) => {
      const translations =
        (term.values as unknown as DictionaryTermValues) ?? {};
      const isMentioned = [term.key, ...Object.values(translations)].some(
        (candidate) =>
          candidate?.trim() &&
          new RegExp(`\\b${escapeRegExp(candidate)}\\b`, "i").test(text),
      );

      if (!isMentioned) {
        return [];
      }

      return [{ translations, meaning: term.description?.trim() || undefined }];
    });
  }

  private async findSimilarSentences(
    dictionaryId: string,
    text: string,
  ): Promise<DictionaryTermValues[]> {
    try {
      const sentences = await this.sentenceSearch.findSimilarSentences(
        dictionaryId,
        text,
        SIMILAR_SENTENCE_LIMIT,
      );
      return sentences.map((sentence) => sentence.values);
    } catch (error) {
      this.logger.warn(
        `Failed to find similar sentences for dictionary ${dictionaryId}: ${(error as Error).message}`,
      );
      return [];
    }
  }
}
