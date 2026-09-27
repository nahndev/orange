import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CommitJobService } from "./commit-job.service";

@ApiTags("commit-jobs")
@Controller("commit-jobs")
export class CommitJobController {
  constructor(private readonly commitJobService: CommitJobService) {}
}
