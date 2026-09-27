import { IsString, Length, MaxLength, MinLength } from "class-validator";

export class DictionaryLanguageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  key!: string;

  @IsString()
  @Length(2, 2)
  country!: string;
}
