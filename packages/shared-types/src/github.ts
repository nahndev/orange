export interface GithubConnection {
  owner: string;
  repo: string;
  branch: string;
}

export interface GithubConnectionStatus {
  connected: boolean;
  connection: GithubConnection | null;
  hasToken: boolean;
}

export interface UpdateGithubConnectionRequest extends GithubConnection {
  /** Omit to keep the currently stored token. */
  token?: string;
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
  /** Omit to use the currently stored token. */
  token?: string;
  /** Required to list branches. */
  owner?: string;
  /** Required to list branches. */
  repo?: string;
  branch?: string;
}
