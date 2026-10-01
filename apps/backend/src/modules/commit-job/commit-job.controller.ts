import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser, type RequestUser } from "../../common/decorators/current-user.decorator";
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
  listConfigs(@CurrentUser() user: RequestUser) {
    return this.commitJobService.listConfigs(user.id);
  }

  @Post()
  createConfig(@CurrentUser() user: RequestUser, @Body() dto: CreateCommitJobConfigDto) {
    return this.commitJobService.createConfig(user.id, dto);
  }

  @Get(":id")
  findConfig(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.commitJobService.findConfig(user.id, id);
  }

  @Patch(":id")
  updateConfig(@CurrentUser() user: RequestUser, @Param("id") id: string, @Body() dto: UpdateCommitJobConfigDto) {
    return this.commitJobService.updateConfig(user.id, id, dto);
  }

  @Delete(":id")
  async removeConfig(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    await this.commitJobService.removeConfig(user.id, id);
    return { success: true };
  }

  @Get(":id/runs")
  listJobs(@CurrentUser() user: RequestUser, @Param("id") id: string) {
    return this.commitJobService.listJobs(user.id, id);
  }
}
