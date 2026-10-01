import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateGithubConnectionDto {
  @ApiProperty({ maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  owner!: string;

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  repo!: string;

  @ApiProperty({ maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  branch!: string;

  @ApiPropertyOptional({ description: "Omit to keep the stored token." })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  token?: string;
}
