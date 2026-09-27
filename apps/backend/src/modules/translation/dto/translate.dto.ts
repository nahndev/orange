import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from "class-validator";

class TranslateLanguageDto {
  @IsString()
  key!: string;

  @IsString()
  country!: string;
}

export class TranslateDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  text!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TranslateLanguageDto)
  languages!: TranslateLanguageDto[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  context?: string;
}
