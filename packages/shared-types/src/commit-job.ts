export type CommitJobTrigger = "SENTENCE_CHANGED";

export type CommitJobStatus = "RUNNING" | "SUCCEEDED" | "FAILED";

export interface CommitJobConfig {
  id: string;
  /** GithubProfile the job pushes to. */
  connectorId: string;
  dictionaryId: string;
  name: string;
  trigger: CommitJobTrigger;
  /** Repository path of each language file; `{language}` is replaced by the language key. */
  filePathTemplate: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommitJobConfigRequest {
  connectorId: string;
  dictionaryId: string;
  name: string;
  trigger?: CommitJobTrigger;
  filePathTemplate?: string;
  enabled?: boolean;
}

export interface UpdateCommitJobConfigRequest {
  connectorId?: string;
  name?: string;
  trigger?: CommitJobTrigger;
  filePathTemplate?: string;
  enabled?: boolean;
}

/** One execution of a commit job config. */
export interface CommitJob {
  id: string;
  configId: string;
  status: CommitJobStatus;
  branch: string | null;
  commitSha: string | null;
  changeRequestNumber: number | null;
  changeRequestUrl: string | null;
  error: string | null;
  createdAt: string;
  finishedAt: string | null;
}
