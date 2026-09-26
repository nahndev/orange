import { apiFetch } from "@/lib/api-client";
import type { AuthUser, ChangePasswordRequest, UpdateProfileRequest } from "@orange/shared-types";

export function getProfile(token: string) {
  return apiFetch<AuthUser>("/account/profile", { token });
}

export function updateProfile(token: string, data: UpdateProfileRequest) {
  return apiFetch<AuthUser>("/account/profile", {
    method: "PATCH",
    token,
    body: JSON.stringify(data)
  });
}

export function changePassword(token: string, data: ChangePasswordRequest) {
  return apiFetch<{ success: boolean }>("/account/change-password", {
    method: "POST",
    token,
    body: JSON.stringify(data)
  });
}
