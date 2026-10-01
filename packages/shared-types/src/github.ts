/** A saved GitHub target (repository + branch + token) shared by the whole application. The token is never exposed. */
export interface GithubProfile {
  id: string;
  name: string;
  owner: string;
  repo: string;
  branch: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGithubProfileRequest {
  name: string;
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

export interface GithubHealth {
  healthy: boolean;
}

export interface GithubRepository {
  owner: string;
  name: string;
  defaultBranch: string;
}

export interface GithubBranch {
  name: string;
}

/** GitHub setup config: token, owner, repo and branch. Each endpoint uses only the fields it needs. */
export interface GithubSetupRequest {
  token: string;
  /** Required to list branches. */
  owner?: string;
  /** Required to list branches. */
  repo?: string;
  branch?: string;
}
