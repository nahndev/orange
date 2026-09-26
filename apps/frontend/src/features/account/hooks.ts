"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { ChangePasswordRequest, UpdateProfileRequest } from "@orange/shared-types";
import { changePassword, getProfile, updateProfile } from "@/services/account-service";
import { accountKeys } from "./query-keys";

export function useProfile() {
  const { data: session } = useSession();
  const token = session?.accessToken;

  return useQuery({
    queryKey: accountKeys.profile(),
    queryFn: () => getProfile(token as string),
    enabled: Boolean(token)
  });
}

export function useUpdateProfile() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(token as string, data),
    onSuccess: (data) => {
      queryClient.setQueryData(accountKeys.profile(), data);
    }
  });
}

export function useChangePassword() {
  const { data: session } = useSession();
  const token = session?.accessToken;

  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(token as string, data)
  });
}
