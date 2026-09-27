import { Body, Controller, Inject, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { API_TRANSLATOR, type ApiTranslatorInterface } from "./api-translator.interface";
import { TranslateDto } from "./dto/translate.dto";

@UseGuards(JwtAuthGuard)
@Controller("translations")
export class TranslationController {
  constructor(
    @Inject(API_TRANSLATOR) private readonly apiTranslator: ApiTranslatorInterface,
  ) {}

  @Post()
  translate(@Body() dto: TranslateDto) {
    return this.apiTranslator.translate(dto);
  }
}
