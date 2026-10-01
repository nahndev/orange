import { Injectable } from "@nestjs/common";
import { MeilisearchClient } from "./meilisearch-client.service";
import { MeilisearchIndexName } from "./meilisearch-index-name";
import type { DictionaryTermDocument, WordRankingInterface } from "./word-ranking.interface";

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
}
