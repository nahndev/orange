import { IsObject, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateDictionaryEntryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  key!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsObject()
  values!: Record<string, string>;
}
