import { Body, Controller, Delete, Get, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser, type RequestUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { GithubSetupDto } from "./dto/github-setup.dto";
import { UpdateGithubConnectionDto } from "./dto/update-github-connection.dto";
import { GithubConnectionService } from "./github-connection.service";

@ApiTags("account")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("account/github")
export class GithubConnectionController {
  constructor(private readonly githubConnectionService: GithubConnectionService) {}

  @Get()
  getGithubConnection(@CurrentUser() user: RequestUser) {
    return this.githubConnectionService.getGithubConnection(user.id);
  }

  @Put()
  updateGithubConnection(@CurrentUser() user: RequestUser, @Body() dto: UpdateGithubConnectionDto) {
    return this.githubConnectionService.updateGithubConnection(user.id, dto);
  }

  @Delete()
  removeGithubConnection(@CurrentUser() user: RequestUser) {
    return this.githubConnectionService.removeGithubConnection(user.id);
  }

  // POST so the token travels in the body, never in the URL.
  @Post("repositories")
  listGithubRepositories(@CurrentUser() user: RequestUser, @Body() dto: GithubSetupDto) {
    return this.githubConnectionService.listGithubRepositories(user.id, dto);
  }

  @Post("branches")
  listGithubBranches(@CurrentUser() user: RequestUser, @Body() dto: GithubSetupDto) {
    return this.githubConnectionService.listGithubBranches(user.id, dto);
  }

  @Get("health")
  checkGithubHealth(@CurrentUser() user: RequestUser) {
    return this.githubConnectionService.checkGithubHealth(user.id);
  }
}
