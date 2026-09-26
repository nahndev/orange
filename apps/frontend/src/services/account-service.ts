import { apiClient } from "@/lib/api-client";
import type { AuthUser, ChangePasswordRequest, UpdateProfileRequest } from "@orange/shared-types";

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
