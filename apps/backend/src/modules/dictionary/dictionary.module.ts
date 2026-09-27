import { Module } from "@nestjs/common";
import { SearchModule } from "../search/search.module";
import { TranslationModule } from "../translation/translation.module";
import { DictionaryController } from "./dictionary.controller";
import { DictionaryService } from "./dictionary.service";

@Module({
  imports: [SearchModule, TranslationModule],
  controllers: [DictionaryController],
  providers: [DictionaryService],
  exports: [DictionaryService]
})
export class DictionaryModule {}
