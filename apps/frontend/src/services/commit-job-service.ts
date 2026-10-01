import { apiClient } from "@/lib/api-client";
import type {
  CommitJob,
  CommitJobConfig,
  CreateCommitJobConfigRequest,
  UpdateCommitJobConfigRequest
} from "@orange/shared-types";

export async function listCommitJobConfigs() {
  const { data } = await apiClient.get<CommitJobConfig[]>("/commit-jobs");
  return data;
}

export async function createCommitJobConfig(payload: CreateCommitJobConfigRequest) {
  const { data } = await apiClient.post<CommitJobConfig>("/commit-jobs", payload);
  return data;
}

export async function updateCommitJobConfig(id: string, payload: UpdateCommitJobConfigRequest) {
  const { data } = await apiClient.patch<CommitJobConfig>(`/commit-jobs/${id}`, payload);
  return data;
}

export async function deleteCommitJobConfig(id: string) {
  const { data } = await apiClient.delete<{ success: boolean }>(`/commit-jobs/${id}`);
  return data;
}

export async function listCommitJobs(configId: string) {
  const { data } = await apiClient.get<CommitJob[]>(`/commit-jobs/${configId}/runs`);
  return data;
}
