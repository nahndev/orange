import { Injectable } from "@nestjs/common";
import { MeilisearchClient } from "./meilisearch-client.service";
import { MeilisearchIndexName } from "./meilisearch-index-name";
import type {
  DictionarySentenceDocument,
  SentenceSearchInterface,
  SentenceSearchQuery,
  SimilarDictionarySentence,
} from "./sentence-search.interface";

const DEFAULT_LIMIT = 50;

interface MeilisearchHit {
  id: string;
}

interface MeilisearchSearchResponse {
  hits: MeilisearchHit[];
}

interface MeilisearchValuesHit {
  id: string;
  values: Record<string, string>;
}

interface MeilisearchValuesSearchResponse {
  hits: MeilisearchValuesHit[];
}

@Injectable()
export class MeilisearchSentenceSearchService implements SentenceSearchInterface {
  private readonly indexName = new MeilisearchIndexName("dictionary_sentences");

  constructor(private readonly client: MeilisearchClient) {}

  async createIndex(dictionaryId: string): Promise<void> {
    const indexName = this.indexName.for(dictionaryId);
    await this.client.request(`/indexes`, "POST", { uid: indexName, primaryKey: "id" });
    await this.client.request(`/indexes/${indexName}/settings/filterable-attributes`, "PUT", ["languages"]);
    await this.client.request(`/indexes/${indexName}/settings/sortable-attributes`, "PUT", ["createdAt"]);
  }

  async deleteIndex(dictionaryId: string): Promise<void> {
    await this.client.request(`/indexes/${this.indexName.for(dictionaryId)}`, "DELETE");
  }

  async indexSentence(dictionaryId: string, sentence: DictionarySentenceDocument): Promise<void> {
    await this.client.request(`/indexes/${this.indexName.for(dictionaryId)}/documents`, "POST", [
      {
        id: sentence.id,
        languages: Object.keys(sentence.values).filter((key) => sentence.values[key]?.trim()),
        values: sentence.values,
        createdAt: sentence.createdAt,
      },
    ]);
  }

  async removeSentence(dictionaryId: string, sentenceId: string): Promise<void> {
    await this.client.request(`/indexes/${this.indexName.for(dictionaryId)}/documents/${sentenceId}`, "DELETE");
  }

  async searchSentences(dictionaryId: string, { language, query, limit = DEFAULT_LIMIT }: SentenceSearchQuery): Promise<string[]> {
    const filters: string[] = [];
    if (language) {
      filters.push(`languages = "${language}"`);
    }

    const searchOnSelectedLanguage = Boolean(language && query);

    const response = await this.client.request<MeilisearchSearchResponse>(`/indexes/${this.indexName.for(dictionaryId)}/search`, "POST", {
      q: searchOnSelectedLanguage ? query : "",
      ...(filters.length > 0 ? { filter: filters.join(" AND ") } : {}),
      sort: ["createdAt:desc"],
      limit,
      ...(searchOnSelectedLanguage ? { attributesToSearchOn: [`values.${language}`] } : {}),
    });

    return response.hits.map((hit) => hit.id);
  }

  async findSimilarSentences(dictionaryId: string, text: string, limit: number): Promise<SimilarDictionarySentence[]> {
    const response = await this.client.request<MeilisearchValuesSearchResponse>(`/indexes/${this.indexName.for(dictionaryId)}/search`, "POST", {
      q: text,
      limit,
    });

    return response.hits.map((hit) => ({ id: hit.id, values: hit.values }));
  }
}
