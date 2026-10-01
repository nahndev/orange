import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

/** GitHub setup config: token, owner, repo and branch. Each endpoint uses only the fields it needs. */
export class GithubSetupDto {
  @ApiProperty({ maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  token!: string;

  @ApiPropertyOptional({ maxLength: 100, description: "Required to list branches." })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  owner?: string;

  @ApiPropertyOptional({ maxLength: 100, description: "Required to list branches." })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  repo?: string;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  branch?: string;
}
