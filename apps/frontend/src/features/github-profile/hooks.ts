"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { CreateGithubProfileRequest, GithubSetupRequest } from "@orange/shared-types";
import {
  checkGithubProfileHealth,
  checkGithubSetupHealth,
  createGithubProfile,
  deleteGithubProfile,
  listGithubBranches,
  listGithubProfiles,
  listGithubRepositories
} from "@/services/github-profile-service";
import { githubProfileKeys } from "./query-keys";

export function useGithubProfiles() {
  const { status } = useSession();

  return useQuery({
    queryKey: githubProfileKeys.list(),
    queryFn: () => listGithubProfiles(),
    enabled: status === "authenticated"
  });
}

export function useCreateGithubProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGithubProfileRequest) => createGithubProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: githubProfileKeys.list() });
    }
  });
}

export function useDeleteGithubProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGithubProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: githubProfileKeys.list() });
    }
  });
}

export function useCheckGithubProfileHealth() {
  return useMutation({
    mutationFn: (id: string) => checkGithubProfileHealth(id)
  });
}

/** Checks the values of the form before the profile is saved. */
export function useCheckGithubSetupHealth() {
  return useMutation({
    mutationFn: (data: GithubSetupRequest) => checkGithubSetupHealth(data)
  });
}

interface GithubListOptions {
  token: string;
  /** Bumped on each click of a load button, so the list reloads. */
  revision: number;
  enabled: boolean;
}

export function useGithubRepositories({ token, revision, enabled }: GithubListOptions) {
  return useQuery({
    queryKey: githubProfileKeys.repositories(revision),
    queryFn: () => listGithubRepositories({ token }),
    enabled,
    retry: false
  });
}

export function useGithubBranches({ owner, repo, ...options }: GithubListOptions & { owner: string; repo: string }) {
  return useQuery({
    queryKey: githubProfileKeys.branches(owner, repo, options.revision),
    queryFn: () => listGithubBranches({ token: options.token, owner, repo }),
    enabled: options.enabled && Boolean(owner) && Boolean(repo),
    retry: false
  });
}
