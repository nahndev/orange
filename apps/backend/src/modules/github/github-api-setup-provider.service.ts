import { Injectable } from "@nestjs/common";
import { Octokit } from "@octokit/rest";
import type { GithubSetupProviderInterface, RepositorySummary } from "./github-setup-provider.interface";

@Injectable()
export class GithubApiSetupProvider implements GithubSetupProviderInterface {
  async listRepositories(token: string): Promise<RepositorySummary[]> {
    const repositories = await new Octokit({ auth: token }).paginate("GET /user/repos", {
      per_page: 100,
      sort: "updated",
    });

    return repositories
      .filter((repository) => repository.permissions?.push)
      .map((repository) => ({
        owner: repository.owner.login,
        name: repository.name,
        defaultBranch: repository.default_branch,
      }));
  }

  async listBranches(token: string, owner: string, repo: string): Promise<string[]> {
    const octokit = new Octokit({ auth: token });
    const branches = await octokit.paginate(octokit.repos.listBranches, { owner, repo, per_page: 100 });

    return branches.map((branch) => branch.name);
  }
}
