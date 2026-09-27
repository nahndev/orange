import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { DictionaryLanguageDto } from "./dictionary-language.dto";

export class UpdateDictionaryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  defaultLanguageKey?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DictionaryLanguageDto)
  languages?: DictionaryLanguageDto[];
}
