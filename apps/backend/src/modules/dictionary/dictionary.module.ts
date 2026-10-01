import { Module } from "@nestjs/common";
import { SearchModule } from "../search/search.module";
import { TranslationModule } from "../translation/translation.module";
import { DictionaryController } from "./dictionary.controller";
import { DictionaryEvents } from "./dictionary-events.service";
import { DictionaryService } from "./dictionary.service";

@Module({
  imports: [SearchModule, TranslationModule],
  controllers: [DictionaryController],
  providers: [DictionaryService, DictionaryEvents],
  exports: [DictionaryService, DictionaryEvents]
})
export class DictionaryModule {}
