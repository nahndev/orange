import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { GithubSetupDto } from "./dto/github-setup.dto";
import { GithubProfileSetupService } from "./github-profile-setup.service";

// POST so the token travels in the body, never in the URL.
@ApiTags("github-profile-setups")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("github-profile-setups")
export class GithubProfileSetupController {
  constructor(private readonly githubProfileSetupService: GithubProfileSetupService) {}

  @Post("health")
  checkSetupHealth(@Body() dto: GithubSetupDto) {
    return this.githubProfileSetupService.checkSetupHealth(dto);
  }

  @Post("repositories")
  listRepositories(@Body() dto: GithubSetupDto) {
    return this.githubProfileSetupService.listRepositories(dto);
  }

  @Post("branches")
  listBranches(@Body() dto: GithubSetupDto) {
    return this.githubProfileSetupService.listBranches(dto);
  }
}
