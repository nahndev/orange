import { Module } from "@nestjs/common";
import { DictionaryModule } from "../dictionary/dictionary.module";
import { GithubModule } from "../github/github.module";
import { CommitJobController } from "./commit-job.controller";
import { CommitJobRunner } from "./commit-job-runner.service";
import { CommitJobService } from "./commit-job.service";

@Module({
  imports: [DictionaryModule, GithubModule],
  controllers: [CommitJobController],
  providers: [CommitJobService, CommitJobRunner],
  exports: [CommitJobService]
})
export class CommitJobModule {}
