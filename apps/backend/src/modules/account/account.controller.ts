import { Body, Controller, Delete, Get, Patch, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AccountService } from "./account.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UpdateGithubConnectionDto } from "../github/dto/update-github-connection.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser, type RequestUser } from "../../common/decorators/current-user.decorator";

@ApiTags("account")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("account")
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get("profile")
  getProfile(@CurrentUser() user: RequestUser) {
    return this.accountService.getProfile(user.id);
  }

  @Patch("profile")
  updateProfile(@CurrentUser() user: RequestUser, @Body() dto: UpdateProfileDto) {
    return this.accountService.updateProfile(user.id, dto);
  }

  @Post("change-password")
  async changePassword(@CurrentUser() user: RequestUser, @Body() dto: ChangePasswordDto) {
    await this.accountService.changePassword(user.id, dto);
    return { success: true };
  }

  @Get("github")
  getGithubConnection(@CurrentUser() user: RequestUser) {
    return this.accountService.getGithubConnection(user.id);
  }

  @Put("github")
  updateGithubConnection(@CurrentUser() user: RequestUser, @Body() dto: UpdateGithubConnectionDto) {
    return this.accountService.updateGithubConnection(user.id, dto);
  }

  @Delete("github")
  removeGithubConnection(@CurrentUser() user: RequestUser) {
    return this.accountService.removeGithubConnection(user.id);
  }

  @Get("github/health")
  checkGithubHealth(@CurrentUser() user: RequestUser) {
    return this.accountService.checkGithubHealth(user.id);
  }
}
