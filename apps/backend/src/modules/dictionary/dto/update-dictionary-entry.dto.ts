import { IsObject, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateDictionaryEntryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  key?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsObject()
  values?: Record<string, string>;
}
