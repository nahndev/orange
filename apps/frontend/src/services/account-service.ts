import { apiClient } from "@/lib/api-client";
import type {
  AuthUser,
  ChangePasswordRequest,
  GithubConnectionStatus,
  GithubHealth,
  UpdateGithubConnectionRequest,
  UpdateProfileRequest
} from "@orange/shared-types";

export async function getProfile() {
  const { data } = await apiClient.get<AuthUser>("/account/profile");
  return data;
}

export async function updateProfile(payload: UpdateProfileRequest) {
  const { data } = await apiClient.patch<AuthUser>("/account/profile", payload);
  return data;
}

export async function changePassword(payload: ChangePasswordRequest) {
  const { data } = await apiClient.post<{ success: boolean }>("/account/change-password", payload);
  return data;
}

export async function getGithubConnection() {
  const { data } = await apiClient.get<GithubConnectionStatus>("/account/github");
  return data;
}

export async function updateGithubConnection(payload: UpdateGithubConnectionRequest) {
  const { data } = await apiClient.put<GithubConnectionStatus>("/account/github", payload);
  return data;
}

export async function removeGithubConnection() {
  const { data } = await apiClient.delete<GithubConnectionStatus>("/account/github");
  return data;
}

export async function checkGithubHealth() {
  const { data } = await apiClient.get<GithubHealth>("/account/github/health");
  return data;
}
