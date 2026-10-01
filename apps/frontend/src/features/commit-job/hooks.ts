"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { CreateCommitJobConfigRequest, UpdateCommitJobConfigRequest } from "@orange/shared-types";
import {
  createCommitJobConfig,
  deleteCommitJobConfig,
  listCommitJobConfigs,
  listCommitJobs,
  updateCommitJobConfig
} from "@/services/commit-job-service";
import { commitJobKeys } from "./query-keys";

export function useCommitJobConfigs() {
  const { status } = useSession();

  return useQuery({
    queryKey: commitJobKeys.configs(),
    queryFn: () => listCommitJobConfigs(),
    enabled: status === "authenticated"
  });
}

export function useCommitJobs(configId: string, enabled: boolean) {
  const { status } = useSession();

  return useQuery({
    queryKey: commitJobKeys.jobs(configId),
    queryFn: () => listCommitJobs(configId),
    enabled: status === "authenticated" && enabled
  });
}

export function useCreateCommitJobConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommitJobConfigRequest) => createCommitJobConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commitJobKeys.configs() });
    }
  });
}

export function useUpdateCommitJobConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommitJobConfigRequest }) => updateCommitJobConfig(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commitJobKeys.configs() });
    }
  });
}

export function useDeleteCommitJobConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCommitJobConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commitJobKeys.configs() });
    }
  });
}
