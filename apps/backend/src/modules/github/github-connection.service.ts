import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type {
  GithubBranch,
  GithubConnectionStatus,
  GithubHealth,
  GithubRepository
} from "@orange/shared-types";
import { PrismaService } from "../../common/prisma/prisma.service";
import { GithubSetupDto } from "./dto/github-setup.dto";
import { UpdateGithubConnectionDto } from "./dto/update-github-connection.dto";
import type { GithubConnectable } from "./github-connectable.interface";
import { GITHUB_PROVIDER, type GithubProviderInterface } from "./github-provider.interface";
import { GITHUB_SETUP_PROVIDER, type GithubSetupProviderInterface } from "./github-setup-provider.interface";
import { GithubTokenCipher } from "./github-token-cipher.service";

@Injectable()
export class GithubConnectionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly githubTokenCipher: GithubTokenCipher,
    @Inject(GITHUB_PROVIDER) private readonly githubProvider: GithubProviderInterface,
    @Inject(GITHUB_SETUP_PROVIDER) private readonly githubSetupProvider: GithubSetupProviderInterface,
  ) {}

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

  async listGithubRepositories(userId: string, dto: GithubSetupDto): Promise<GithubRepository[]> {
    const token = await this.resolveGithubToken(userId, dto.token);

    try {
      return await this.githubSetupProvider.listRepositories(token);
    } catch {
      throw new BadRequestException("Failed to load repositories. Check the GitHub token.");
    }
  }

  async listGithubBranches(userId: string, dto: GithubSetupDto): Promise<GithubBranch[]> {
    const { owner, repo } = dto;
    if (!owner || !repo) {
      throw new BadRequestException("Owner and repository are required");
    }

    const token = await this.resolveGithubToken(userId, dto.token);

    try {
      const names = await this.githubSetupProvider.listBranches(token, owner, repo);
      return names.map((name) => ({ name }));
    } catch {
      throw new BadRequestException("Failed to load branches. Check the GitHub token and repository.");
    }
  }

  /** Prefers the token typed by the user; falls back to the stored one. */
  private async resolveGithubToken(userId: string, token?: string): Promise<string> {
    if (token) return token;

    const user = await this.findUserOrThrow(userId);
    if (!user.githubTokenEncrypted) {
      throw new BadRequestException("GitHub token is required");
    }

    return this.githubTokenCipher.decrypt(user.githubTokenEncrypted);
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

  private async findUserOrThrow(userId: string): Promise<GithubConnectable> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }
}
