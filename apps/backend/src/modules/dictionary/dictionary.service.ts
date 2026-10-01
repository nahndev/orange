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
  DictionaryDetail,
  DictionaryLanguage,
  DictionarySentence,
  DictionaryTerm,
  DictionaryTermValues,
} from "@orange/shared-types";
import {
  Prisma,
  type Dictionary as DictionaryRecord,
  type DictionarySentence as DictionarySentenceRecord,
  type DictionaryTerm as DictionaryTermRecord,
} from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { SentenceSearchInterface } from "../search/sentence-search.interface";
import { SENTENCE_SEARCH } from "../search/sentence-search.interface";
import type { WordRankingInterface } from "../search/word-ranking.interface";
import { WORD_RANKING } from "../search/word-ranking.interface";
import type { ApiTranslatorInterface } from "../translation/api-translator.interface";
import { API_TRANSLATOR } from "../translation/api-translator.interface";
import { DictionaryEvents } from "./dictionary-events.service";
import { DictionaryPromptService } from "./dictionary-promt.service";
import { CreateDictionarySentenceDto } from "./dto/create-dictionary-sentence.dto";
import { CreateDictionaryTermDto } from "./dto/create-dictionary-term.dto";
import { CreateDictionaryDto } from "./dto/create-dictionary.dto";
import { TranslateDictionarySentenceDto } from "./dto/translate-dictionary-sentence.dto";
import { UpdateDictionarySentenceDto } from "./dto/update-dictionary-sentence.dto";
import { UpdateDictionaryTermDto } from "./dto/update-dictionary-term.dto";
import { UpdateDictionaryDto } from "./dto/update-dictionary.dto";

const COUNTRY_CODES = new Set(COUNTRIES.map((country) => country.code));

type DictionaryWithLanguages = DictionaryRecord & {
  languages: { key: string; country: string }[];
};
type DictionaryWithLanguagesAndTerms = DictionaryWithLanguages & {
  terms: DictionaryTermRecord[];
  sentences: DictionarySentenceRecord[];
};

@Injectable()
export class DictionaryService {
  private readonly logger = new Logger(DictionaryService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(API_TRANSLATOR)
    private readonly apiTranslator: ApiTranslatorInterface,
    @Inject(WORD_RANKING) private readonly wordRanking: WordRankingInterface,
    @Inject(SENTENCE_SEARCH)
    private readonly sentenceSearch: SentenceSearchInterface,
    private readonly events: DictionaryEvents,
    private readonly prompts: DictionaryPromptService,
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
        await this.backfillTermsWithDefaultLanguage(
          tx,
          existing.terms,
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

  private async backfillTermsWithDefaultLanguage(
    tx: Prisma.TransactionClient,
    terms: DictionaryTermRecord[],
    addedLanguageKeys: string[],
    defaultLanguageKey: string,
  ): Promise<void> {
    for (const term of terms) {
      const values = (term.values as unknown as DictionaryTermValues) ?? {};
      const defaultValue = values[defaultLanguageKey] ?? "";

      const nextValues: DictionaryTermValues = { ...values };
      for (const key of addedLanguageKeys) {
        nextValues[key] = defaultValue;
      }

      await tx.dictionaryTerm.update({
        where: { id: term.id },
        data: { values: nextValues as Prisma.InputJsonValue },
      });
    }
  }

  async remove(id: string): Promise<void> {
    await this.findOrThrow(id);
    await this.prisma.dictionary.delete({ where: { id } });
    await this.safeDeleteIndexes(id);
  }

  async addTerm(
    dictionaryId: string,
    dto: CreateDictionaryTermDto,
  ): Promise<DictionaryTerm> {
    const dictionary = await this.findOrThrow(dictionaryId);
    const values = this.assertValidValues(dictionary, dto.values);

    const term = await this.prisma.dictionaryTerm.create({
      data: {
        dictionaryId,
        key: dto.key,
        description: dto.description,
        values,
      },
    });

    await this.safeIndexTerm(dictionaryId, term);

    return this.toDictionaryTerm(term);
  }

  async updateTerm(
    dictionaryId: string,
    termId: string,
    dto: UpdateDictionaryTermDto,
  ): Promise<DictionaryTerm> {
    const dictionary = await this.findOrThrow(dictionaryId);
    await this.findTermOrThrow(dictionaryId, termId);
    const values = dto.values
      ? this.assertValidValues(dictionary, dto.values)
      : undefined;

    const term = await this.prisma.dictionaryTerm.update({
      where: { id: termId },
      data: {
        key: dto.key,
        description: dto.description,
        values,
      },
    });

    await this.safeIndexTerm(dictionaryId, term);

    return this.toDictionaryTerm(term);
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
    this.events.emitSentenceChanged({
      dictionaryId,
      sentenceId: sentence.id,
      change: "created",
    });

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
    this.events.emitSentenceChanged({
      dictionaryId,
      sentenceId: sentence.id,
      change: "updated",
    });

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

  async removeTerm(dictionaryId: string, termId: string): Promise<void> {
    await this.findTermOrThrow(dictionaryId, termId);
    await this.prisma.dictionaryTerm.delete({ where: { id: termId } });
    await this.safeRemoveTerm(dictionaryId, termId);
  }

  async translateSentence(
    dictionaryId: string,
    dto: TranslateDictionarySentenceDto,
  ): Promise<Record<string, string>> {
    const dictionary = await this.findOrThrow(dictionaryId);

    const prompts = await this.prompts.buildTranslationPrompts(
      dictionaryId,
      dictionary,
      dto.text,
      dto.languages,
    );

    return this.apiTranslator.translate({ prompts });
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

  private async safeIndexTerm(
    dictionaryId: string,
    term: DictionaryTermRecord,
  ): Promise<void> {
    try {
      await this.wordRanking.indexTerm(dictionaryId, {
        id: term.id,
        key: term.key,
        description: term.description,
        values: (term.values as unknown as DictionaryTermValues) ?? {},
      });
    } catch (error) {
      this.logger.warn(
        `Failed to index dictionary term ${term.id}: ${(error as Error).message}`,
      );
    }
  }

  private async safeRemoveTerm(
    dictionaryId: string,
    termId: string,
  ): Promise<void> {
    try {
      await this.wordRanking.removeTerm(dictionaryId, termId);
    } catch (error) {
      this.logger.warn(
        `Failed to remove dictionary term ${termId} from index: ${(error as Error).message}`,
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
        values: (sentence.values as unknown as DictionaryTermValues) ?? {},
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
  ): Promise<DictionaryWithLanguagesAndTerms> {
    const dictionary = await this.prisma.dictionary.findUnique({
      where: { id },
      include: { languages: true, terms: true, sentences: true },
    });

    if (!dictionary) {
      throw new NotFoundException("Dictionary not found");
    }

    return dictionary;
  }

  private async findTermOrThrow(
    dictionaryId: string,
    termId: string,
  ): Promise<DictionaryTermRecord> {
    const term = await this.prisma.dictionaryTerm.findFirst({
      where: { id: termId, dictionaryId },
    });

    if (!term) {
      throw new NotFoundException("Dictionary term not found");
    }

    return term;
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
    values: DictionaryTermValues,
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
    dictionary: DictionaryWithLanguagesAndTerms,
  ): DictionaryDetail {
    return {
      ...this.toDictionary(dictionary),
      terms: dictionary.terms.map((term) => this.toDictionaryTerm(term)),
      sentences: dictionary.sentences.map((sentence) =>
        this.toDictionarySentence(sentence),
      ),
    };
  }

  private toDictionaryTerm(term: DictionaryTermRecord): DictionaryTerm {
    return {
      id: term.id,
      key: term.key,
      description: term.description,
      values: (term.values as unknown as DictionaryTermValues) ?? {},
      createdAt: term.createdAt.toISOString(),
      updatedAt: term.updatedAt.toISOString(),
    };
  }

  private toDictionarySentence(
    sentence: DictionarySentenceRecord,
  ): DictionarySentence {
    return {
      id: sentence.id,
      values: (sentence.values as unknown as DictionaryTermValues) ?? {},
      createdAt: sentence.createdAt.toISOString(),
      updatedAt: sentence.updatedAt.toISOString(),
    };
  }
}
