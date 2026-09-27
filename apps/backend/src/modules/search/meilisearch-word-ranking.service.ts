import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { RankableDictionaryEntry, WordRankingInterface } from "./word-ranking.interface";

const INDEX_NAME = "dictionary_entries";
const DEFAULT_LIMIT = 5;

interface MeilisearchHit {
  key: string;
}

interface MeilisearchSearchResponse {
  hits: MeilisearchHit[];
}

@Injectable()
export class MeilisearchWordRankingService implements WordRankingInterface, OnModuleInit {
  private readonly logger = new Logger(MeilisearchWordRankingService.name);

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
      ]);
    } catch (error) {
      this.logger.warn(
        `Failed to configure Meilisearch filterable attributes: ${(error as Error).message}`,
      );
    }
  }

  async indexEntry(dictionaryId: string, entry: RankableDictionaryEntry): Promise<void> {
    await this.request(`/indexes/${INDEX_NAME}/documents`, "POST", [
      {
        id: entry.id,
        dictionaryId,
        key: entry.key,
        description: entry.description,
        values: entry.values,
      },
    ]);
  }

  async removeEntry(_dictionaryId: string, entryId: string): Promise<void> {
    await this.request(`/indexes/${INDEX_NAME}/documents/${entryId}`, "DELETE");
  }

  async findSimilarWords(
    dictionaryId: string,
    word: string,
    limit = DEFAULT_LIMIT,
  ): Promise<string[]> {
    const response = await this.request<MeilisearchSearchResponse>(
      `/indexes/${INDEX_NAME}/search`,
      "POST",
      {
        q: word,
        filter: `dictionaryId = "${dictionaryId}"`,
        limit: limit + 1,
      },
    );

    return response.hits
      .map((hit) => hit.key)
      .filter((key) => key.toLowerCase() !== word.toLowerCase())
      .slice(0, limit);
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
