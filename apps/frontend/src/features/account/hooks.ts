"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { ChangePasswordRequest, UpdateGithubConnectionRequest, UpdateProfileRequest } from "@orange/shared-types";
import {
  changePassword,
  checkGithubHealth,
  getGithubConnection,
  getProfile,
  listGithubBranches,
  listGithubRepositories,
  removeGithubConnection,
  updateGithubConnection,
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

export function useGithubConnection() {
  const { status } = useSession();

  return useQuery({
    queryKey: accountKeys.github(),
    queryFn: () => getGithubConnection(),
    enabled: status === "authenticated"
  });
}

export function useUpdateGithubConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateGithubConnectionRequest) => updateGithubConnection(data),
    onSuccess: (data) => {
      queryClient.setQueryData(accountKeys.github(), data);
    }
  });
}

export function useRemoveGithubConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => removeGithubConnection(),
    onSuccess: (data) => {
      queryClient.setQueryData(accountKeys.github(), data);
    }
  });
}

export function useCheckGithubHealth() {
  return useMutation({
    mutationFn: () => checkGithubHealth()
  });
}

interface GithubListOptions {
  /** Token typed by the user; undefined falls back to the stored token. */
  token?: string;
  /** Bumped each time the user submits a token, so lists reload. */
  revision: number;
  enabled: boolean;
}

export function useGithubRepositories({ token, revision, enabled }: GithubListOptions) {
  return useQuery({
    queryKey: accountKeys.githubRepositories(revision),
    queryFn: () => listGithubRepositories({ token }),
    enabled,
    retry: false
  });
}

export function useGithubBranches({ owner, repo, ...options }: GithubListOptions & { owner: string; repo: string }) {
  return useQuery({
    queryKey: accountKeys.githubBranches(owner, repo, options.revision),
    queryFn: () => listGithubBranches({ token: options.token, owner, repo }),
    enabled: options.enabled && Boolean(owner) && Boolean(repo),
    retry: false
  });
}
