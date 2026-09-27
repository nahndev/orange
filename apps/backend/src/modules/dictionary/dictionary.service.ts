import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { COUNTRIES } from "@orange/language";
import type {
  Dictionary,
  DictionaryContext,
  DictionaryDetail,
  DictionaryEntry,
  DictionaryEntryValues,
  DictionaryLanguage,
  DictionarySentence,
} from "@orange/shared-types";
import {
  Prisma,
  type DictionaryContext as DictionaryContextRecord,
  type DictionaryEntry as DictionaryEntryRecord,
  type DictionarySentence as DictionarySentenceRecord,
  type Dictionary as DictionaryRecord,
} from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { API_TRANSLATOR } from "../translation/api-translator.interface";
import type { ApiTranslatorInterface } from "../translation/api-translator.interface";
import { WORD_RANKING } from "../search/word-ranking.interface";
import type { WordRankingInterface } from "../search/word-ranking.interface";
import { SENTENCE_SEARCH } from "../search/sentence-search.interface";
import type { SentenceSearchInterface, SimilarDictionarySentence } from "../search/sentence-search.interface";
import { CreateDictionaryEntryDto } from "./dto/create-dictionary-entry.dto";
import { CreateDictionaryDto } from "./dto/create-dictionary.dto";
import { CreateDictionarySentenceDto } from "./dto/create-dictionary-sentence.dto";
import { TranslateDictionarySentenceDto } from "./dto/translate-dictionary-sentence.dto";
import { UpdateDictionaryEntryDto } from "./dto/update-dictionary-entry.dto";
import { UpdateDictionaryDto } from "./dto/update-dictionary.dto";
import { UpdateDictionarySentenceDto } from "./dto/update-dictionary-sentence.dto";

const SIMILAR_WORD_LIMIT = 5;
const SIMILAR_SENTENCE_LIMIT = 5;
const MAX_TRANSLATION_CONTEXT_LENGTH = 2000;

const COUNTRY_CODES = new Set(COUNTRIES.map((country) => country.code));

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type DictionaryWithLanguages = DictionaryRecord & {
  languages: { key: string; country: string }[];
};
type DictionaryWithLanguagesAndEntries = DictionaryWithLanguages & {
  entries: DictionaryEntryRecord[];
  sentences: DictionarySentenceRecord[];
};

@Injectable()
export class DictionaryService {
  private readonly logger = new Logger(DictionaryService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(API_TRANSLATOR) private readonly apiTranslator: ApiTranslatorInterface,
    @Inject(WORD_RANKING) private readonly wordRanking: WordRankingInterface,
    @Inject(SENTENCE_SEARCH) private readonly sentenceSearch: SentenceSearchInterface,
  ) {}

  async list(): Promise<Dictionary[]> {
    const dictionaries = await this.prisma.dictionary.findMany({
      include: { languages: true },
      orderBy: { createdAt: "desc" },
    });

    return dictionaries.map((dictionary) => this.toDictionary(dictionary));
  }

  async create(dto: CreateDictionaryDto): Promise<Dictionary> {
    const dictionary = await this.prisma.dictionary.create({
      data: { name: dto.name },
      include: { languages: true },
    });

    await this.safeCreateIndexes(dictionary.id);

    return this.toDictionary(dictionary);
  }

  async findOne(id: string): Promise<DictionaryDetail> {
    const dictionary = await this.findOrThrow(id);
    return this.toDictionaryDetail(dictionary);
  }

  async update(id: string, dto: UpdateDictionaryDto): Promise<Dictionary> {
    const existing = await this.findOrThrow(id);

    if (dto.languages) {
      this.assertValidLanguages(dto.languages);
    }

    const nextLanguageKeys = dto.languages
      ? dto.languages.map((language) => language.key)
      : existing.languages.map((language) => language.key);

    let nextDefaultLanguageKey =
      dto.defaultLanguageKey ?? existing.defaultLanguageKey;
    if (
      dto.defaultLanguageKey &&
      !nextLanguageKeys.includes(dto.defaultLanguageKey)
    ) {
      throw new BadRequestException(
        "defaultLanguageKey must match one of the dictionary's configured languages",
      );
    }
    if (
      nextDefaultLanguageKey &&
      !nextLanguageKeys.includes(nextDefaultLanguageKey)
    ) {
      nextDefaultLanguageKey = null;
    }

    const existingLanguageKeys = existing.languages.map(
      (language) => language.key,
    );
    const addedLanguageKeys = dto.languages
      ? nextLanguageKeys.filter((key) => !existingLanguageKeys.includes(key))
      : [];

    const dictionary = await this.prisma.$transaction(async (tx) => {
      if (dto.languages) {
        await tx.dictionaryLanguage.deleteMany({ where: { dictionaryId: id } });
      }

      if (addedLanguageKeys.length > 0 && existing.defaultLanguageKey) {
        await this.backfillEntriesWithDefaultLanguage(
          tx,
          existing.entries,
          addedLanguageKeys,
          existing.defaultLanguageKey,
        );
      }

      return tx.dictionary.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          defaultLanguageKey: nextDefaultLanguageKey,
          languages: dto.languages
            ? {
                create: dto.languages.map((language) => ({
                  key: language.key,
                  country: language.country,
                })),
              }
            : undefined,
        },
        include: { languages: true },
      });
    });

    return this.toDictionary(dictionary);
  }

  private async backfillEntriesWithDefaultLanguage(
    tx: Prisma.TransactionClient,
    entries: DictionaryEntryRecord[],
    addedLanguageKeys: string[],
    defaultLanguageKey: string,
  ): Promise<void> {
    for (const entry of entries) {
      const values = (entry.values as unknown as DictionaryEntryValues) ?? {};
      const defaultValue = values[defaultLanguageKey] ?? "";

      const nextValues: DictionaryEntryValues = { ...values };
      for (const key of addedLanguageKeys) {
        nextValues[key] = defaultValue;
      }

      await tx.dictionaryEntry.update({
        where: { id: entry.id },
        data: { values: nextValues as Prisma.InputJsonValue },
      });
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOrThrow(id);
    await this.prisma.dictionary.delete({ where: { id } });
    await this.safeDeleteIndexes(id);
  }

  async addEntry(
    dictionaryId: string,
    dto: CreateDictionaryEntryDto,
  ): Promise<DictionaryEntry> {
    const dictionary = await this.findOrThrow(dictionaryId);
    const values = this.assertValidValues(dictionary, dto.values);

    const entry = await this.prisma.dictionaryEntry.create({
      data: {
        dictionaryId,
        key: dto.key,
        description: dto.description,
        values,
      },
    });

    await this.safeIndexEntry(dictionaryId, entry);

    return this.toDictionaryEntry(entry);
  }

  async updateEntry(
    dictionaryId: string,
    entryId: string,
    dto: UpdateDictionaryEntryDto,
  ): Promise<DictionaryEntry> {
    const dictionary = await this.findOrThrow(dictionaryId);
    await this.findEntryOrThrow(dictionaryId, entryId);
    const values = dto.values
      ? this.assertValidValues(dictionary, dto.values)
      : undefined;

    const entry = await this.prisma.dictionaryEntry.update({
      where: { id: entryId },
      data: {
        key: dto.key,
        description: dto.description,
        values,
      },
    });

    await this.safeIndexEntry(dictionaryId, entry);

    return this.toDictionaryEntry(entry);
  }

  async addSentence(
    dictionaryId: string,
    dto: CreateDictionarySentenceDto,
  ): Promise<DictionarySentence> {
    const dictionary = await this.findOrThrow(dictionaryId);
    const values = this.assertValidValues(dictionary, dto.values);

    const sentence = await this.prisma.dictionarySentence.create({
      data: {
        dictionaryId,
        values,
      },
    });

    await this.safeIndexSentence(dictionaryId, sentence);

    return this.toDictionarySentence(sentence);
  }

  async updateSentence(
    dictionaryId: string,
    sentenceId: string,
    dto: UpdateDictionarySentenceDto,
  ): Promise<DictionarySentence> {
    const dictionary = await this.findOrThrow(dictionaryId);
    await this.findSentenceOrThrow(dictionaryId, sentenceId);
    const values = this.assertValidValues(dictionary, dto.values);

    const sentence = await this.prisma.dictionarySentence.update({
      where: { id: sentenceId },
      data: { values },
    });

    await this.safeIndexSentence(dictionaryId, sentence);

    return this.toDictionarySentence(sentence);
  }

  async listSentences(
    dictionaryId: string,
    query: { language?: string; q?: string },
  ): Promise<DictionarySentence[]> {
    await this.findOrThrow(dictionaryId);

    const ids = await this.sentenceSearch.searchSentences(dictionaryId, {
      language: query.language,
      query: query.q,
    });

    const records = await this.prisma.dictionarySentence.findMany({
      where: { id: { in: ids }, dictionaryId },
    });
    const recordsById = new Map(records.map((record) => [record.id, record]));

    return ids
      .map((id) => recordsById.get(id))
      .filter((record): record is DictionarySentenceRecord => Boolean(record))
      .map((record) => this.toDictionarySentence(record));
  }

  async removeEntry(dictionaryId: string, entryId: string): Promise<void> {
    await this.findEntryOrThrow(dictionaryId, entryId);
    await this.prisma.dictionaryEntry.delete({ where: { id: entryId } });
    await this.safeRemoveEntry(dictionaryId, entryId);
  }

  async generateContext(
    dictionaryId: string,
    entryId: string,
  ): Promise<DictionaryContext> {
    const dictionary = await this.findOrThrow(dictionaryId);
    const entry = await this.findEntryOrThrow(dictionaryId, entryId);

    const generated = await this.apiTranslator.generateContext({
      word: entry.key,
      description: entry.description ?? undefined,
      languages: dictionary.languages.map((language) => ({
        key: language.key,
        country: language.country,
      })),
    });

    const context = await this.prisma.dictionaryContext.upsert({
      where: { entryId },
      create: {
        entryId,
        description: generated.description,
        keywords: generated.keywords as unknown as Prisma.InputJsonValue,
        relatedWords: generated.relatedWords as unknown as Prisma.InputJsonValue,
      },
      update: {
        description: generated.description,
        keywords: generated.keywords as unknown as Prisma.InputJsonValue,
        relatedWords: generated.relatedWords as unknown as Prisma.InputJsonValue,
      },
    });

    return this.toDictionaryContext(context);
  }

  async getContext(
    dictionaryId: string,
    entryId: string,
  ): Promise<DictionaryContext | null> {
    await this.findEntryOrThrow(dictionaryId, entryId);
    const context = await this.prisma.dictionaryContext.findUnique({
      where: { entryId },
    });

    return context ? this.toDictionaryContext(context) : null;
  }

  async findSimilarWords(dictionaryId: string, word: string): Promise<string[]> {
    await this.findOrThrow(dictionaryId);
    return this.wordRanking.findSimilarWords(dictionaryId, word, SIMILAR_WORD_LIMIT);
  }

  async translateSentence(
    dictionaryId: string,
    dto: TranslateDictionarySentenceDto,
  ): Promise<Record<string, string>> {
    const dictionary = await this.findOrThrow(dictionaryId);

    const matchedEntries = dictionary.entries.filter((entry) => {
      const values = (entry.values as unknown as DictionaryEntryValues) ?? {};
      const candidates = [entry.key, ...Object.values(values)];
      return candidates.some(
        (candidate) =>
          candidate?.trim() &&
          new RegExp(`\\b${escapeRegExp(candidate)}\\b`, "i").test(dto.text),
      );
    });
    const similarSentences = await this.safeFindSimilarSentences(dictionaryId, dto.text);

    return this.apiTranslator.translate({
      text: dto.text,
      languages: dto.languages,
      context: this.buildTranslationContext(dictionary, matchedEntries, similarSentences),
    });
  }

  private buildTranslationContext(
    dictionary: DictionaryWithLanguagesAndEntries,
    matchedEntries: DictionaryEntryRecord[],
    similarSentences: SimilarDictionarySentence[],
  ): string | undefined {
    const sections: string[] = [];

    if (dictionary.description) {
      sections.push(`Dictionary description: ${dictionary.description}`);
    }

    if (matchedEntries.length > 0) {
      const hint = matchedEntries
        .map((entry) => {
          const values = (entry.values as unknown as DictionaryEntryValues) ?? {};
          return `${entry.key}: ${Object.entries(values)
            .map(([lang, value]) => `${lang}=${value}`)
            .join(", ")}`;
        })
        .join("\n");
      sections.push(`Use these exact translations for these terms:\n${hint}`);
    }

    if (similarSentences.length > 0) {
      const hint = similarSentences
        .map((sentence) =>
          Object.entries(sentence.values)
            .map(([lang, value]) => `${lang}=${value}`)
            .join(", "),
        )
        .join("\n");
      sections.push(`Similar sentences already translated in this dictionary:\n${hint}`);
    }

    if (sections.length === 0) {
      return undefined;
    }

    return sections.join("\n\n").slice(0, MAX_TRANSLATION_CONTEXT_LENGTH);
  }

  private async safeFindSimilarSentences(
    dictionaryId: string,
    text: string,
  ): Promise<SimilarDictionarySentence[]> {
    try {
      return await this.sentenceSearch.findSimilarSentences(dictionaryId, text, SIMILAR_SENTENCE_LIMIT);
    } catch (error) {
      this.logger.warn(
        `Failed to find similar sentences for dictionary ${dictionaryId}: ${(error as Error).message}`,
      );
      return [];
    }
  }

  private async safeCreateIndexes(dictionaryId: string): Promise<void> {
    try {
      await this.wordRanking.createIndex(dictionaryId);
      await this.sentenceSearch.createIndex(dictionaryId);
    } catch (error) {
      this.logger.warn(
        `Failed to create search indexes for dictionary ${dictionaryId}: ${(error as Error).message}`,
      );
    }
  }

  private async safeDeleteIndexes(dictionaryId: string): Promise<void> {
    try {
      await this.wordRanking.deleteIndex(dictionaryId);
      await this.sentenceSearch.deleteIndex(dictionaryId);
    } catch (error) {
      this.logger.warn(
        `Failed to delete search indexes for dictionary ${dictionaryId}: ${(error as Error).message}`,
      );
    }
  }

  private async safeIndexEntry(
    dictionaryId: string,
    entry: DictionaryEntryRecord,
  ): Promise<void> {
    try {
      await this.wordRanking.indexEntry(dictionaryId, {
        id: entry.id,
        key: entry.key,
        description: entry.description,
        values: (entry.values as unknown as DictionaryEntryValues) ?? {},
      });
    } catch (error) {
      this.logger.warn(
        `Failed to index dictionary entry ${entry.id}: ${(error as Error).message}`,
      );
    }
  }

  private async safeRemoveEntry(dictionaryId: string, entryId: string): Promise<void> {
    try {
      await this.wordRanking.removeEntry(dictionaryId, entryId);
    } catch (error) {
      this.logger.warn(
        `Failed to remove dictionary entry ${entryId} from index: ${(error as Error).message}`,
      );
    }
  }

  private async safeIndexSentence(
    dictionaryId: string,
    sentence: DictionarySentenceRecord,
  ): Promise<void> {
    try {
      await this.sentenceSearch.indexSentence(dictionaryId, {
        id: sentence.id,
        values: (sentence.values as unknown as DictionaryEntryValues) ?? {},
        createdAt: sentence.createdAt.toISOString(),
      });
    } catch (error) {
      this.logger.warn(
        `Failed to index dictionary sentence ${sentence.id}: ${(error as Error).message}`,
      );
    }
  }

  private async findOrThrow(
    id: string,
  ): Promise<DictionaryWithLanguagesAndEntries> {
    const dictionary = await this.prisma.dictionary.findUnique({
      where: { id },
      include: { languages: true, entries: true, sentences: true },
    });

    if (!dictionary) {
      throw new NotFoundException("Dictionary not found");
    }

    return dictionary;
  }

  private async findEntryOrThrow(
    dictionaryId: string,
    entryId: string,
  ): Promise<DictionaryEntryRecord> {
    const entry = await this.prisma.dictionaryEntry.findFirst({
      where: { id: entryId, dictionaryId },
    });

    if (!entry) {
      throw new NotFoundException("Dictionary entry not found");
    }

    return entry;
  }

  private async findSentenceOrThrow(
    dictionaryId: string,
    sentenceId: string,
  ): Promise<DictionarySentenceRecord> {
    const sentence = await this.prisma.dictionarySentence.findFirst({
      where: { id: sentenceId, dictionaryId },
    });

    if (!sentence) {
      throw new NotFoundException("Dictionary sentence not found");
    }

    return sentence;
  }

  private assertValidLanguages(languages: DictionaryLanguage[]): void {
    const keys = new Set<string>();

    for (const language of languages) {
      if (keys.has(language.key)) {
        throw new BadRequestException(
          `Duplicate language key "${language.key}"`,
        );
      }
      keys.add(language.key);

      if (!COUNTRY_CODES.has(language.country)) {
        throw new BadRequestException(
          `Unknown country code "${language.country}"`,
        );
      }
    }
  }

  private assertValidValues(
    dictionary: DictionaryWithLanguages,
    values: DictionaryEntryValues,
  ): Prisma.InputJsonValue {
    const configuredKeys = dictionary.languages.map((language) => language.key);
    const configuredKeySet = new Set(configuredKeys);

    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(([key]) => configuredKeySet.has(key)),
    );

    const missingKeys = configuredKeys.filter(
      (key) => !filteredValues[key] || filteredValues[key].trim().length === 0,
    );
    if (missingKeys.length > 0) {
      throw new BadRequestException(
        `Missing translation value(s) for language(s): ${missingKeys.join(", ")}`,
      );
    }

    return filteredValues;
  }

  private toDictionary(dictionary: DictionaryWithLanguages): Dictionary {
    return {
      id: dictionary.id,
      name: dictionary.name,
      description: dictionary.description,
      defaultLanguageKey: dictionary.defaultLanguageKey,
      languages: dictionary.languages.map((language) => ({
        key: language.key,
        country: language.country,
      })),
      createdAt: dictionary.createdAt.toISOString(),
      updatedAt: dictionary.updatedAt.toISOString(),
    };
  }

  private toDictionaryDetail(
    dictionary: DictionaryWithLanguagesAndEntries,
  ): DictionaryDetail {
    return {
      ...this.toDictionary(dictionary),
      entries: dictionary.entries.map((entry) => this.toDictionaryEntry(entry)),
      sentences: dictionary.sentences.map((sentence) => this.toDictionarySentence(sentence)),
    };
  }

  private toDictionaryEntry(entry: DictionaryEntryRecord): DictionaryEntry {
    return {
      id: entry.id,
      key: entry.key,
      description: entry.description,
      values: (entry.values as unknown as DictionaryEntryValues) ?? {},
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    };
  }

  private toDictionarySentence(sentence: DictionarySentenceRecord): DictionarySentence {
    return {
      id: sentence.id,
      values: (sentence.values as unknown as DictionaryEntryValues) ?? {},
      createdAt: sentence.createdAt.toISOString(),
      updatedAt: sentence.updatedAt.toISOString(),
    };
  }

  private toDictionaryContext(context: DictionaryContextRecord): DictionaryContext {
    return {
      description: context.description,
      keywords: (context.keywords as unknown as string[]) ?? [],
      relatedWords:
        (context.relatedWords as unknown as DictionaryContext["relatedWords"]) ?? [],
      createdAt: context.createdAt.toISOString(),
      updatedAt: context.updatedAt.toISOString(),
    };
  }
}
