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
} from "@orange/shared-types";
import {
  Prisma,
  type DictionaryContext as DictionaryContextRecord,
  type DictionaryEntry as DictionaryEntryRecord,
  type Dictionary as DictionaryRecord,
} from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { API_TRANSLATOR } from "../translation/api-translator.interface";
import type { ApiTranslatorInterface } from "../translation/api-translator.interface";
import { WORD_RANKING } from "../search/word-ranking.interface";
import type { WordRankingInterface } from "../search/word-ranking.interface";
import { CreateDictionaryEntryDto } from "./dto/create-dictionary-entry.dto";
import { CreateDictionaryDto } from "./dto/create-dictionary.dto";
import { UpdateDictionaryEntryDto } from "./dto/update-dictionary-entry.dto";
import { UpdateDictionaryDto } from "./dto/update-dictionary.dto";

const SIMILAR_WORD_LIMIT = 5;

const COUNTRY_CODES = new Set(COUNTRIES.map((country) => country.code));

type DictionaryWithLanguages = DictionaryRecord & {
  languages: { key: string; country: string }[];
};
type DictionaryWithLanguagesAndEntries = DictionaryWithLanguages & {
  entries: DictionaryEntryRecord[];
};

@Injectable()
export class DictionaryService {
  private readonly logger = new Logger(DictionaryService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(API_TRANSLATOR) private readonly apiTranslator: ApiTranslatorInterface,
    @Inject(WORD_RANKING) private readonly wordRanking: WordRankingInterface,
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

  private async findOrThrow(
    id: string,
  ): Promise<DictionaryWithLanguagesAndEntries> {
    const dictionary = await this.prisma.dictionary.findUnique({
      where: { id },
      include: { languages: true, entries: true },
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
