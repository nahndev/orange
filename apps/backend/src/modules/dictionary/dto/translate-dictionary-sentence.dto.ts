import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsString, MaxLength, MinLength, ValidateNested } from "class-validator";

class TranslateDictionarySentenceLanguageDto {
  @ApiProperty()
  @IsString()
  key!: string;

  @ApiProperty({ example: "US" })
  @IsString()
  country!: string;
}

export class TranslateDictionarySentenceDto {
  @ApiProperty({ minLength: 1, maxLength: 500 })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  text!: string;

  @ApiProperty({ type: [TranslateDictionarySentenceLanguageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TranslateDictionarySentenceLanguageDto)
  languages!: TranslateDictionarySentenceLanguageDto[];
}
