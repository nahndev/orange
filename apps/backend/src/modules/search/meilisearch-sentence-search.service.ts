import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  RankableDictionarySentence,
  SentenceSearchInterface,
  SentenceSearchQuery,
} from "./sentence-search.interface";

const INDEX_NAME = "dictionary_sentences";
const DEFAULT_LIMIT = 50;

interface MeilisearchHit {
  id: string;
}

interface MeilisearchSearchResponse {
  hits: MeilisearchHit[];
}

@Injectable()
export class MeilisearchSentenceSearchService implements SentenceSearchInterface, OnModuleInit {
  private readonly logger = new Logger(MeilisearchSentenceSearchService.name);

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.request(`/indexes`, "POST", { uid: INDEX_NAME, primaryKey: "id" });
    } catch {
      // Index likely already exists; safe to ignore.
    }

    try {
      await this.request(`/indexes/${INDEX_NAME}/settings/filterable-attributes`, "PUT", [
        "dictionaryId",
        "languages",
      ]);
      await this.request(`/indexes/${INDEX_NAME}/settings/sortable-attributes`, "PUT", ["createdAt"]);
    } catch (error) {
      this.logger.warn(
        `Failed to configure Meilisearch filterable/sortable attributes: ${(error as Error).message}`,
      );
    }
  }

  async indexSentence(dictionaryId: string, sentence: RankableDictionarySentence): Promise<void> {
    await this.request(`/indexes/${INDEX_NAME}/documents`, "POST", [
      {
        id: sentence.id,
        dictionaryId,
        languages: Object.keys(sentence.values).filter((key) => sentence.values[key]?.trim()),
        values: sentence.values,
        createdAt: sentence.createdAt,
      },
    ]);
  }

  async removeSentence(_dictionaryId: string, sentenceId: string): Promise<void> {
    await this.request(`/indexes/${INDEX_NAME}/documents/${sentenceId}`, "DELETE");
  }

  async searchSentences(dictionaryId: string, { language, query, limit = DEFAULT_LIMIT }: SentenceSearchQuery): Promise<string[]> {
    const filters = [`dictionaryId = "${dictionaryId}"`];
    if (language) {
      filters.push(`languages = "${language}"`);
    }

    const searchOnSelectedLanguage = Boolean(language && query);

    const response = await this.request<MeilisearchSearchResponse>(`/indexes/${INDEX_NAME}/search`, "POST", {
      q: searchOnSelectedLanguage ? query : "",
      filter: filters.join(" AND "),
      sort: ["createdAt:desc"],
      limit,
      ...(searchOnSelectedLanguage ? { attributesToSearchOn: [`values.${language}`] } : {}),
    });

    return response.hits.map((hit) => hit.id);
  }

  private async request<T = unknown>(path: string, method: string, body?: unknown): Promise<T> {
    const host = this.config.get<string>("MEILISEARCH_HOST", "http://localhost:7701");
    const apiKey = this.config.get<string>("MEILISEARCH_API_KEY");

    const response = await fetch(`${host}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Meilisearch request to ${path} failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }
}
