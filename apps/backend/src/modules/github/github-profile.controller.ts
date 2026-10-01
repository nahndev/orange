import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CreateGithubProfileDto } from "./dto/create-github-profile.dto";
import { GithubProfileService } from "./github-profile.service";

@ApiTags("github-profiles")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("github-profiles")
export class GithubProfileController {
  constructor(private readonly githubProfileService: GithubProfileService) {}

  @Get()
  listProfiles() {
    return this.githubProfileService.listProfiles();
  }

  @Post()
  createProfile(@Body() dto: CreateGithubProfileDto) {
    return this.githubProfileService.createProfile(dto);
  }

  @Delete(":id")
  async removeProfile(@Param("id") id: string) {
    await this.githubProfileService.removeProfile(id);
    return { success: true };
  }

  @Get(":id/health")
  checkProfileHealth(@Param("id") id: string) {
    return this.githubProfileService.checkProfileHealth(id);
  }
}
