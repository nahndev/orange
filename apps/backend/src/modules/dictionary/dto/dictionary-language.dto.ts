import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length, MaxLength, MinLength } from "class-validator";

export class DictionaryLanguageDto {
  @ApiProperty({ minLength: 1, maxLength: 20 })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  key!: string;

  @ApiProperty({ minLength: 2, maxLength: 2, example: "US" })
  @IsString()
  @Length(2, 2)
  country!: string;
}
