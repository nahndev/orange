import { Module } from "@nestjs/common";
import { ApiTranslator } from "./api-translator.service";
import { API_TRANSLATOR } from "./api-translator.interface";

@Module({
  providers: [ApiTranslator, { provide: API_TRANSLATOR, useExisting: ApiTranslator }],
  exports: [API_TRANSLATOR],
})
export class TranslationModule {}
