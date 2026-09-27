import { Injectable } from "@nestjs/common";
import { MeilisearchClient } from "./meilisearch-client.service";
import { MeilisearchIndexName } from "./meilisearch-index-name";
import type { DictionaryTermDocument, WordRankingInterface } from "./word-ranking.interface";

const DEFAULT_LIMIT = 5;

interface MeilisearchHit {
  key: string;
}

interface MeilisearchSearchResponse {
  hits: MeilisearchHit[];
}

@Injectable()
export class MeilisearchWordRankingService implements WordRankingInterface {
  private readonly indexName = new MeilisearchIndexName("dictionary_terms");

  constructor(private readonly client: MeilisearchClient) {}

  async createIndex(dictionaryId: string): Promise<void> {
    await this.client.request(`/indexes`, "POST", { uid: this.indexName.for(dictionaryId), primaryKey: "id" });
  }

  async deleteIndex(dictionaryId: string): Promise<void> {
    await this.client.request(`/indexes/${this.indexName.for(dictionaryId)}`, "DELETE");
  }

  async indexTerm(dictionaryId: string, term: DictionaryTermDocument): Promise<void> {
    await this.client.request(`/indexes/${this.indexName.for(dictionaryId)}/documents`, "POST", [
      {
        id: term.id,
        key: term.key,
        description: term.description,
        values: term.values,
      },
    ]);
  }

  async removeTerm(dictionaryId: string, termId: string): Promise<void> {
    await this.client.request(`/indexes/${this.indexName.for(dictionaryId)}/documents/${termId}`, "DELETE");
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
