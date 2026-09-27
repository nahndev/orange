import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { COUNTRIES } from "@orange/language";
import type {
  Dictionary,
  DictionaryDetail,
  DictionaryEntry,
  DictionaryEntryValues,
  DictionaryLanguage,
} from "@orange/shared-types";
import {
  Prisma,
  type DictionaryEntry as DictionaryEntryRecord,
  type Dictionary as DictionaryRecord,
} from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateDictionaryEntryDto } from "./dto/create-dictionary-entry.dto";
import { CreateDictionaryDto } from "./dto/create-dictionary.dto";
import { UpdateDictionaryEntryDto } from "./dto/update-dictionary-entry.dto";
import { UpdateDictionaryDto } from "./dto/update-dictionary.dto";

const COUNTRY_CODES = new Set(COUNTRIES.map((country) => country.code));

type DictionaryWithLanguages = DictionaryRecord & {
  languages: { key: string; country: string }[];
};
type DictionaryWithLanguagesAndEntries = DictionaryWithLanguages & {
  entries: DictionaryEntryRecord[];
};

@Injectable()
export class DictionaryService {
  constructor(private readonly prisma: PrismaService) {}

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

    const dictionary = await this.prisma.$transaction(async (tx) => {
      if (dto.languages) {
        await tx.dictionaryLanguage.deleteMany({ where: { dictionaryId: id } });
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

    return this.toDictionaryEntry(entry);
  }

  async removeEntry(dictionaryId: string, entryId: string): Promise<void> {
    await this.findEntryOrThrow(dictionaryId, entryId);
    await this.prisma.dictionaryEntry.delete({ where: { id: entryId } });
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
    values?: DictionaryEntryValues,
  ): Prisma.InputJsonValue {
    if (!values) {
      return {};
    }

    const configuredKeys = new Set(
      dictionary.languages.map((language) => language.key),
    );
    const unknownKeys = Object.keys(values).filter(
      (key) => !configuredKeys.has(key),
    );

    if (unknownKeys.length > 0) {
      throw new BadRequestException(
        `Unknown language key(s): ${unknownKeys.join(", ")}`,
      );
    }

    return values;
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
}
