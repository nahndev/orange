import { ApiProperty } from "@nestjs/swagger";
import { IsObject } from "class-validator";

export class UpdateDictionarySentenceDto {
  @ApiProperty({ type: Object, description: "Sentence text keyed by language" })
  @IsObject()
  values!: Record<string, string>;
}
