import type { GithubConnectable } from "./github-connectable.interface";

export interface CommitFile {
  path: string;
  content: string;
}

export interface CommitInput {
  message: string;
  files: CommitFile[];
  /** Branch to commit on. Defaults to the connection branch. */
  branch?: string;
}

export interface ChangeRequestInput {
  title: string;
  body?: string;
  /** Branch holding the changes. Merged into the connection branch. */
  headBranch: string;
}

export interface BranchInput {
  /** Name of the branch to create from the connection branch. */
  name: string;
}

export interface CommitResult {
  sha: string;
}

export interface ChangeRequestResult {
  number: number;
  url: string;
}

export interface GithubProviderInterface {
  isHealthy(conn: GithubConnectable): Promise<boolean>;
  createBranch(conn: GithubConnectable, input: BranchInput): Promise<void>;
  createCommit(conn: GithubConnectable, input: CommitInput): Promise<CommitResult>;
  createChangeRequest(conn: GithubConnectable, input: ChangeRequestInput): Promise<ChangeRequestResult>;
}

export const GITHUB_PROVIDER = Symbol("GITHUB_PROVIDER");
