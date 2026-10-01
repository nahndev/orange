import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateCommitJobConfigDto } from "./create-commit-job-config.dto";

export class UpdateCommitJobConfigDto extends PartialType(OmitType(CreateCommitJobConfigDto, ["dictionaryId"] as const)) {}
