import { ApiProperty } from "@nestjs/swagger";
import { IsObject } from "class-validator";

export class CreateDictionarySentenceDto {
  @ApiProperty({ type: Object, description: "Sentence text keyed by language" })
  @IsObject()
  values!: Record<string, string>;
}
