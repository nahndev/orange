import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
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
import { CreateDictionaryEntryDto } from "./dto/create-dictionary-entry.dto";
import { CreateDictionarySentenceDto } from "./dto/create-dictionary-sentence.dto";
import { UpdateDictionaryDto } from "./dto/update-dictionary.dto";
import { UpdateDictionaryEntryDto } from "./dto/update-dictionary-entry.dto";

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

  @Post(":id/entries")
  addEntry(@Param("id") id: string, @Body() dto: CreateDictionaryEntryDto) {
    return this.dictionaryService.addEntry(id, dto);
  }

  @Patch(":id/entries/:entryId")
  updateEntry(@Param("id") id: string, @Param("entryId") entryId: string, @Body() dto: UpdateDictionaryEntryDto) {
    return this.dictionaryService.updateEntry(id, entryId, dto);
  }

  @Delete(":id/entries/:entryId")
  async removeEntry(@Param("id") id: string, @Param("entryId") entryId: string) {
    await this.dictionaryService.removeEntry(id, entryId);
    return { success: true };
  }

  @Post(":id/entries/:entryId/context")
  generateContext(@Param("id") id: string, @Param("entryId") entryId: string) {
    return this.dictionaryService.generateContext(id, entryId);
  }

  @Get(":id/entries/:entryId/context")
  async getContext(@Param("id") id: string, @Param("entryId") entryId: string) {
    const context = await this.dictionaryService.getContext(id, entryId);
    if (!context) {
      throw new NotFoundException("Dictionary context not found");
    }
    return context;
  }

  @Post(":id/sentences")
  addSentence(@Param("id") id: string, @Body() dto: CreateDictionarySentenceDto) {
    return this.dictionaryService.addSentence(id, dto);
  }

  @Get(":id/word-ranking")
  findSimilarWords(@Param("id") id: string, @Query("word") word?: string) {
    if (!word || word.trim().length === 0) {
      throw new BadRequestException("word query parameter is required");
    }
    return this.dictionaryService.findSimilarWords(id, word);
  }
}
