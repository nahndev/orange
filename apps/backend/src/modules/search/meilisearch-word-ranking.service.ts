import { Injectable } from "@nestjs/common";
import { MeilisearchClient } from "./meilisearch-client.service";
import { MeilisearchIndexName } from "./meilisearch-index-name";
import type { DictionaryEntryDocument, WordRankingInterface } from "./word-ranking.interface";

const DEFAULT_LIMIT = 5;

interface MeilisearchHit {
  key: string;
}

interface MeilisearchSearchResponse {
  hits: MeilisearchHit[];
}

@Injectable()
export class MeilisearchWordRankingService implements WordRankingInterface {
  private readonly indexName = new MeilisearchIndexName("dictionary_entries");

  constructor(private readonly client: MeilisearchClient) {}

  async createIndex(dictionaryId: string): Promise<void> {
    await this.client.request(`/indexes`, "POST", { uid: this.indexName.for(dictionaryId), primaryKey: "id" });
  }

  async deleteIndex(dictionaryId: string): Promise<void> {
    await this.client.request(`/indexes/${this.indexName.for(dictionaryId)}`, "DELETE");
  }

  async indexEntry(dictionaryId: string, entry: DictionaryEntryDocument): Promise<void> {
    await this.client.request(`/indexes/${this.indexName.for(dictionaryId)}/documents`, "POST", [
      {
        id: entry.id,
        key: entry.key,
        description: entry.description,
        values: entry.values,
      },
    ]);
  }

  async removeEntry(dictionaryId: string, entryId: string): Promise<void> {
    await this.client.request(`/indexes/${this.indexName.for(dictionaryId)}/documents/${entryId}`, "DELETE");
  }

  async findSimilarWords(
    dictionaryId: string,
    word: string,
    limit = DEFAULT_LIMIT,
  ): Promise<string[]> {
    const response = await this.client.request<MeilisearchSearchResponse>(
      `/indexes/${this.indexName.for(dictionaryId)}/search`,
      "POST",
      {
        q: word,
        limit: limit + 1,
      },
    );

    return response.hits
      .map((hit) => hit.key)
      .filter((key) => key.toLowerCase() !== word.toLowerCase())
      .slice(0, limit);
  }
}
