"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type {
  CreateDictionaryEntryRequest,
  CreateDictionaryRequest,
  UpdateDictionaryEntryRequest,
  UpdateDictionaryRequest
} from "@orange/shared-types";
import {
  createDictionary,
  createDictionaryEntry,
  deleteDictionary,
  deleteDictionaryEntry,
  getDictionary,
  listDictionaries,
  updateDictionary,
  updateDictionaryEntry
} from "@/services/dictionary-service";
import { dictionaryKeys } from "./query-keys";

export function useDictionaries() {
  const { status } = useSession();

  return useQuery({
    queryKey: dictionaryKeys.list(),
    queryFn: () => listDictionaries(),
    enabled: status === "authenticated"
  });
}

export function useDictionary(id: string) {
  const { status } = useSession();

  return useQuery({
    queryKey: dictionaryKeys.detail(id),
    queryFn: () => getDictionary(id),
    enabled: status === "authenticated" && Boolean(id)
  });
}

export function useCreateDictionary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDictionaryRequest) => createDictionary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.list() });
    }
  });
}

export function useUpdateDictionary(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDictionaryRequest) => updateDictionary(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.list() });
    }
  });
}

export function useDeleteDictionary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDictionary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.list() });
    }
  });
}

export function useCreateDictionaryEntry(dictionaryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDictionaryEntryRequest) => createDictionaryEntry(dictionaryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.detail(dictionaryId) });
    }
  });
}

export function useUpdateDictionaryEntry(dictionaryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entryId, data }: { entryId: string; data: UpdateDictionaryEntryRequest }) =>
      updateDictionaryEntry(dictionaryId, entryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.detail(dictionaryId) });
    }
  });
}

export function useDeleteDictionaryEntry(dictionaryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryId: string) => deleteDictionaryEntry(dictionaryId, entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.detail(dictionaryId) });
    }
  });
}
