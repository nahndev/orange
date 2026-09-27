import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { DictionaryService } from "./dictionary.service";
import { CreateDictionaryDto } from "./dto/create-dictionary.dto";
import { CreateDictionaryEntryDto } from "./dto/create-dictionary-entry.dto";
import { UpdateDictionaryDto } from "./dto/update-dictionary.dto";
import { UpdateDictionaryEntryDto } from "./dto/update-dictionary-entry.dto";

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
}
