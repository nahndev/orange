import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { GithubHealth, GithubProfile } from "@orange/shared-types";
import type { GithubProfile as GithubProfileRecord } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateGithubProfileDto } from "./dto/create-github-profile.dto";
import { GITHUB_PROVIDER, type GithubProviderInterface } from "./github-provider.interface";
import { GithubTokenCipher } from "./github-token-cipher.service";

@Injectable()
export class GithubProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly githubTokenCipher: GithubTokenCipher,
    @Inject(GITHUB_PROVIDER) private readonly githubProvider: GithubProviderInterface
  ) {}

  async listProfiles(): Promise<GithubProfile[]> {
    const profiles = await this.prisma.githubProfile.findMany({ orderBy: { createdAt: "desc" } });
    return profiles.map((profile) => this.toProfile(profile));
  }

  async createProfile(dto: CreateGithubProfileDto): Promise<GithubProfile> {
    const profile = await this.prisma.githubProfile.create({
      data: {
        name: dto.name,
        githubOwner: dto.owner,
        githubRepo: dto.repo,
        githubBranch: dto.branch,
        githubTokenEncrypted: this.githubTokenCipher.encrypt(dto.token)
      }
    });

    return this.toProfile(profile);
  }

  async removeProfile(id: string): Promise<void> {
    await this.findProfileOrThrow(id);

    const jobCount = await this.prisma.commitJobConfig.count({ where: { connectorId: id } });
    if (jobCount > 0) {
      throw new ConflictException("GitHub profile is used by commit jobs");
    }

    await this.prisma.githubProfile.delete({ where: { id } });
  }

  async checkProfileHealth(id: string): Promise<GithubHealth> {
    const profile = await this.findProfileOrThrow(id);
    return { healthy: await this.githubProvider.isHealthy(profile) };
  }

  private async findProfileOrThrow(id: string): Promise<GithubProfileRecord> {
    const profile = await this.prisma.githubProfile.findUnique({ where: { id } });
    if (!profile) {
      throw new NotFoundException("GitHub profile not found");
    }

    return profile;
  }

  private toProfile(profile: GithubProfileRecord): GithubProfile {
    return {
      id: profile.id,
      name: profile.name,
      owner: profile.githubOwner,
      repo: profile.githubRepo,
      branch: profile.githubBranch,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString()
    };
  }
}
