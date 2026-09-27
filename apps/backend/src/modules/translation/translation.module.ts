import { Module } from "@nestjs/common";
import { TranslationController } from "./translation.controller";
import { ApiTranslator } from "./api-translator.service";
import { API_TRANSLATOR } from "./api-translator.interface";

@Module({
  controllers: [TranslationController],
  providers: [ApiTranslator, { provide: API_TRANSLATOR, useExisting: ApiTranslator }],
  exports: [API_TRANSLATOR],
})
export class TranslationModule {}
