"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { ChangePasswordRequest, UpdateProfileRequest } from "@orange/shared-types";
import {
  changePassword,
  getProfile,
  updateProfile
} from "@/services/account-service";
import { accountKeys } from "./query-keys";

export function useProfile() {
  const { status } = useSession();

  return useQuery({
    queryKey: accountKeys.profile(),
    queryFn: () => getProfile(),
    enabled: status === "authenticated"
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(accountKeys.profile(), data);
    }
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data)
  });
}
