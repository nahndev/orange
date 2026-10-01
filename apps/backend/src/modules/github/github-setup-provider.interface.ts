export interface RepositorySummary {
  owner: string;
  name: string;
  defaultBranch: string;
}

/** Discovers what a GitHub token can reach, before any connection is stored. */
export interface GithubSetupProviderInterface {
  /** Repositories the token can push to. */
  listRepositories(token: string): Promise<RepositorySummary[]>;
  listBranches(token: string, owner: string, repo: string): Promise<string[]>;
}

export const GITHUB_SETUP_PROVIDER = Symbol("GITHUB_SETUP_PROVIDER");
