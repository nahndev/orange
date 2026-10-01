/** An entity that can be connected to a GitHub repository. */
export interface GithubConnectable {
  githubOwner: string | null;
  githubRepo: string | null;
  githubBranch: string | null;
  /** Encrypted with GithubTokenCipher; never the plain token. */
  githubTokenEncrypted: string | null;
}
