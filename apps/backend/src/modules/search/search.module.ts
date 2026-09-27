import { Module } from "@nestjs/common";
import { MeilisearchClient } from "./meilisearch-client.service";
import { MeilisearchSentenceSearchService } from "./meilisearch-sentence-search.service";
import { MeilisearchWordRankingService } from "./meilisearch-word-ranking.service";
import { SENTENCE_SEARCH } from "./sentence-search.interface";
import { WORD_RANKING } from "./word-ranking.interface";

@Module({
  providers: [
    MeilisearchClient,
    MeilisearchWordRankingService,
    { provide: WORD_RANKING, useExisting: MeilisearchWordRankingService },
    MeilisearchSentenceSearchService,
    { provide: SENTENCE_SEARCH, useExisting: MeilisearchSentenceSearchService },
  ],
  exports: [WORD_RANKING, SENTENCE_SEARCH],
})
export class SearchModule {}
