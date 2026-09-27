import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { DictionaryService } from "./dictionary.service";
import { CreateDictionaryDto } from "./dto/create-dictionary.dto";
import { CreateDictionaryTermDto } from "./dto/create-dictionary-term.dto";
import { CreateDictionarySentenceDto } from "./dto/create-dictionary-sentence.dto";
import { TranslateDictionarySentenceDto } from "./dto/translate-dictionary-sentence.dto";
import { UpdateDictionaryDto } from "./dto/update-dictionary.dto";
import { UpdateDictionaryTermDto } from "./dto/update-dictionary-term.dto";
import { UpdateDictionarySentenceDto } from "./dto/update-dictionary-sentence.dto";

@ApiTags("dictionaries")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("dictionaries")
export class DictionaryController {
  constructor(private readonly dictionaryService: DictionaryService) {}

  @Get()
  list() {
    return this.dictionaryService.list();
  }

  @Post()
  create(@Body() dto: CreateDictionaryDto) {
    return this.dictionaryService.create(dto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.dictionaryService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateDictionaryDto) {
    return this.dictionaryService.update(id, dto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    await this.dictionaryService.remove(id);
    return { success: true };
  }

  @Post(":id/terms")
  addTerm(@Param("id") id: string, @Body() dto: CreateDictionaryTermDto) {
    return this.dictionaryService.addTerm(id, dto);
  }

  @Patch(":id/terms/:termId")
  updateTerm(@Param("id") id: string, @Param("termId") termId: string, @Body() dto: UpdateDictionaryTermDto) {
    return this.dictionaryService.updateTerm(id, termId, dto);
  }

  @Delete(":id/terms/:termId")
  async removeTerm(@Param("id") id: string, @Param("termId") termId: string) {
    await this.dictionaryService.removeTerm(id, termId);
    return { success: true };
  }

  @Post(":id/sentences")
  addSentence(@Param("id") id: string, @Body() dto: CreateDictionarySentenceDto) {
    return this.dictionaryService.addSentence(id, dto);
  }

  @Get(":id/sentences")
  listSentences(@Param("id") id: string, @Query("language") language?: string, @Query("q") q?: string) {
    return this.dictionaryService.listSentences(id, { language, q });
  }

  @Patch(":id/sentences/:sentenceId")
  updateSentence(
    @Param("id") id: string,
    @Param("sentenceId") sentenceId: string,
    @Body() dto: UpdateDictionarySentenceDto,
  ) {
    return this.dictionaryService.updateSentence(id, sentenceId, dto);
  }

  @Get(":id/word-ranking")
  findSimilarWords(@Param("id") id: string, @Query("word") word?: string) {
    if (!word || word.trim().length === 0) {
      throw new BadRequestException("word query parameter is required");
    }
    return this.dictionaryService.findSimilarWords(id, word);
  }

  @Post(":id/translations")
  translate(@Param("id") id: string, @Body() dto: TranslateDictionarySentenceDto) {
    return this.dictionaryService.translateSentence(id, dto);
  }
}
