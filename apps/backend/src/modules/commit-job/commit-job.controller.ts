import { Controller } from "@nestjs/common";
import { CommitJobService } from "./commit-job.service";

@Controller("commit-jobs")
export class CommitJobController {
  constructor(private readonly commitJobService: CommitJobService) {}
}
