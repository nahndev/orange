import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CommitJobService } from "./commit-job.service";
import { CreateCommitJobConfigDto } from "./dto/create-commit-job-config.dto";
import { UpdateCommitJobConfigDto } from "./dto/update-commit-job-config.dto";

@ApiTags("commit-jobs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("commit-jobs")
export class CommitJobController {
  constructor(private readonly commitJobService: CommitJobService) {}

  @Get()
  listConfigs() {
    return this.commitJobService.listConfigs();
  }

  @Post()
  createConfig(@Body() dto: CreateCommitJobConfigDto) {
    return this.commitJobService.createConfig(dto);
  }

  @Get(":id")
  findConfig(@Param("id") id: string) {
    return this.commitJobService.findConfig(id);
  }

  @Patch(":id")
  updateConfig(@Param("id") id: string, @Body() dto: UpdateCommitJobConfigDto) {
    return this.commitJobService.updateConfig(id, dto);
  }

  @Delete(":id")
  async removeConfig(@Param("id") id: string) {
    await this.commitJobService.removeConfig(id);
    return { success: true };
  }

  @Get(":id/runs")
  listJobs(@Param("id") id: string) {
    return this.commitJobService.listJobs(id);
  }
}
