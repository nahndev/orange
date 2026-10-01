import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import type { AuthUser, GithubConnectionStatus, GithubHealth } from "@orange/shared-types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UpdateGithubConnectionDto } from "../github/dto/update-github-connection.dto";
import type { GithubConnectable } from "../github/github-connectable.interface";
import { GITHUB_PROVIDER, type GithubProviderInterface } from "../github/github-provider.interface";
import { GithubTokenCipher } from "../github/github-token-cipher.service";
import { ChangePasswordDto } from "./dto/change-password.dto";

interface UserWithProfile extends GithubConnectable {
  id: string;
  email: string;
  name: string | null;
}

@Injectable()
export class AccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly githubTokenCipher: GithubTokenCipher,
    @Inject(GITHUB_PROVIDER) private readonly githubProvider: GithubProviderInterface,
  ) {}

  async getProfile(userId: string): Promise<AuthUser> {
    const user = await this.findUserOrThrow(userId);
    return this.toAuthUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<AuthUser> {
    await this.findUserOrThrow(userId);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name }
    });

    return this.toAuthUser(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { account: true }
    });

    if (!user?.account) {
      throw new NotFoundException("Account not found");
    }

    const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.account.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.account.update({
      where: { userId },
      data: { passwordHash }
    });
  }

  async getGithubConnection(userId: string): Promise<GithubConnectionStatus> {
    const user = await this.findUserOrThrow(userId);
    return this.toGithubStatus(user);
  }

  async updateGithubConnection(userId: string, dto: UpdateGithubConnectionDto): Promise<GithubConnectionStatus> {
    const current = await this.findUserOrThrow(userId);
    if (!dto.token && !current.githubTokenEncrypted) {
      throw new BadRequestException("GitHub token is required");
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        githubOwner: dto.owner,
        githubRepo: dto.repo,
        githubBranch: dto.branch,
        githubTokenEncrypted: dto.token ? this.githubTokenCipher.encrypt(dto.token) : undefined
      }
    });

    return this.toGithubStatus(user);
  }

  async removeGithubConnection(userId: string): Promise<GithubConnectionStatus> {
    await this.findUserOrThrow(userId);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { githubOwner: null, githubRepo: null, githubBranch: null, githubTokenEncrypted: null }
    });

    return this.toGithubStatus(user);
  }

  async checkGithubHealth(userId: string): Promise<GithubHealth> {
    const user = await this.findUserOrThrow(userId);
    return { healthy: await this.githubProvider.isHealthy(user) };
  }

  private toGithubStatus(user: GithubConnectable): GithubConnectionStatus {
    const { githubOwner, githubRepo, githubBranch, githubTokenEncrypted } = user;
    const hasToken = Boolean(githubTokenEncrypted);
    if (!githubOwner || !githubRepo || !githubBranch) {
      return { connected: false, connection: null, hasToken };
    }

    return {
      connected: hasToken,
      connection: { owner: githubOwner, repo: githubRepo, branch: githubBranch },
      hasToken
    };
  }

  private async findUserOrThrow(userId: string): Promise<UserWithProfile> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  private toAuthUser(user: UserWithProfile): AuthUser {
    return { id: user.id, email: user.email, name: user.name };
  }
}
