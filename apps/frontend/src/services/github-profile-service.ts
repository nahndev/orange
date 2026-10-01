import { apiClient } from "@/lib/api-client";
import type {
  CreateGithubProfileRequest,
  GithubBranch,
  GithubHealth,
  GithubProfile,
  GithubRepository,
  GithubSetupRequest
} from "@orange/shared-types";

export async function listGithubProfiles() {
  const { data } = await apiClient.get<GithubProfile[]>("/github-profiles");
  return data;
}

export async function createGithubProfile(payload: CreateGithubProfileRequest) {
  const { data } = await apiClient.post<GithubProfile>("/github-profiles", payload);
  return data;
}

export async function deleteGithubProfile(id: string) {
  const { data } = await apiClient.delete<{ success: boolean }>(`/github-profiles/${id}`);
  return data;
}

export async function checkGithubProfileHealth(id: string) {
  const { data } = await apiClient.get<GithubHealth>(`/github-profiles/${id}/health`);
  return data;
}

export async function checkGithubSetupHealth(payload: GithubSetupRequest) {
  const { data } = await apiClient.post<GithubHealth>("/github-profile-setups/health", payload);
  return data;
}

export async function listGithubRepositories(payload: GithubSetupRequest) {
  const { data } = await apiClient.post<GithubRepository[]>("/github-profile-setups/repositories", payload);
  return data;
}

export async function listGithubBranches(payload: GithubSetupRequest) {
  const { data } = await apiClient.post<GithubBranch[]>("/github-profile-setups/branches", payload);
  return data;
}
