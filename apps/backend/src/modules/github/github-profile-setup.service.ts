import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { GithubBranch, GithubHealth, GithubRepository } from "@orange/shared-types";
import { GithubSetupDto } from "./dto/github-setup.dto";
import { GITHUB_SETUP_PROVIDER, type GithubSetupProviderInterface } from "./github-setup-provider.interface";

/** Discovers what a token can reach, and checks unsaved setup values, before a GithubProfile exists. */
@Injectable()
export class GithubProfileSetupService {
  constructor(@Inject(GITHUB_SETUP_PROVIDER) private readonly githubSetupProvider: GithubSetupProviderInterface) {}

  async checkSetupHealth(dto: GithubSetupDto): Promise<GithubHealth> {
    const { owner, repo, branch } = dto;
    if (!owner || !repo || !branch) {
      throw new BadRequestException("Owner, repository and branch are required");
    }

    return { healthy: await this.githubSetupProvider.isHealthy(dto.token, owner, repo, branch) };
  }

  async listRepositories(dto: GithubSetupDto): Promise<GithubRepository[]> {
    try {
      return await this.githubSetupProvider.listRepositories(dto.token);
    } catch {
      throw new BadRequestException("Failed to load repositories. Check the GitHub token.");
    }
  }

  async listBranches(dto: GithubSetupDto): Promise<GithubBranch[]> {
    const { owner, repo } = dto;
    if (!owner || !repo) {
      throw new BadRequestException("Owner and repository are required");
    }

    try {
      const names = await this.githubSetupProvider.listBranches(dto.token, owner, repo);
      return names.map((name) => ({ name }));
    } catch {
      throw new BadRequestException("Failed to load branches. Check the GitHub token and repository.");
    }
  }
}
