import { Module } from "@nestjs/common";
import { MeilisearchWordRankingService } from "./meilisearch-word-ranking.service";
import { WORD_RANKING } from "./word-ranking.interface";

@Module({
  providers: [
    MeilisearchWordRankingService,
    { provide: WORD_RANKING, useExisting: MeilisearchWordRankingService },
  ],
  exports: [WORD_RANKING],
})
export class SearchModule {}
