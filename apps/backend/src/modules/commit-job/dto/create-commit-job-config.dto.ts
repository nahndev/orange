import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export const COMMIT_JOB_TRIGGERS = ["SENTENCE_CHANGED"] as const;

/** Relative path that contains the `{language}` placeholder and never escapes the repository. */
export const FILE_PATH_TEMPLATE_PATTERN = /^(?!\/)(?!.*\.\.)(?=.*\{language\}).+$/;

export class CreateCommitJobConfigDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  dictionaryId!: string;

  @ApiProperty({ maxLength: 120 })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ enum: COMMIT_JOB_TRIGGERS, default: "SENTENCE_CHANGED" })
  @IsOptional()
  @IsIn(COMMIT_JOB_TRIGGERS)
  trigger?: (typeof COMMIT_JOB_TRIGGERS)[number];

  @ApiPropertyOptional({ default: "locales/{language}.json", description: "Must contain {language}" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Matches(FILE_PATH_TEMPLATE_PATTERN, {
    message: "filePathTemplate must be a relative path that contains {language}"
  })
  filePathTemplate?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
