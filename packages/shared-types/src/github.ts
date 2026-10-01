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
