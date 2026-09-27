import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from "class-validator";

class TranslateLanguageDto {
  @ApiProperty()
  @IsString()
  key!: string;

  @ApiProperty({ example: "US" })
  @IsString()
  country!: string;
}

export class TranslateDto {
  @ApiProperty({ minLength: 1, maxLength: 500 })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  text!: string;

  @ApiProperty({ type: [TranslateLanguageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TranslateLanguageDto)
  languages!: TranslateLanguageDto[];

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  context?: string;
}
