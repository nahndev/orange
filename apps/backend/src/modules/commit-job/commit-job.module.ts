import { Module } from "@nestjs/common";
import { CommitJobController } from "./commit-job.controller";
import { CommitJobService } from "./commit-job.service";

@Module({
  controllers: [CommitJobController],
  providers: [CommitJobService],
  exports: [CommitJobService]
})
export class CommitJobModule {}
