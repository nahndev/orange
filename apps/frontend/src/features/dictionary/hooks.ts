"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type {
  CreateDictionaryEntryRequest,
  CreateDictionaryRequest,
  CreateDictionarySentenceRequest,
  ListDictionarySentencesQuery,
  TranslateRequest,
  UpdateDictionaryEntryRequest,
  UpdateDictionaryRequest,
  UpdateDictionarySentenceRequest
} from "@orange/shared-types";
import {
  createDictionary,
  createDictionaryEntry,
  createDictionarySentence,
  deleteDictionary,
  deleteDictionaryEntry,
  getDictionary,
  listDictionaries,
  listDictionarySentences,
  updateDictionary,
  updateDictionaryEntry,
  updateDictionarySentence
} from "@/services/dictionary-service";
import { translateText } from "@/services/translation-service";
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

export function useCreateDictionarySentence(dictionaryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDictionarySentenceRequest) => createDictionarySentence(dictionaryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.detail(dictionaryId) });
    }
  });
}

export function useDictionarySentences(dictionaryId: string, filters: ListDictionarySentencesQuery) {
  const { status } = useSession();

  return useQuery({
    queryKey: dictionaryKeys.sentences(dictionaryId, filters),
    queryFn: () => listDictionarySentences(dictionaryId, filters),
    enabled: status === "authenticated" && Boolean(dictionaryId)
  });
}

export function useUpdateDictionarySentence(dictionaryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sentenceId, data }: { sentenceId: string; data: UpdateDictionarySentenceRequest }) =>
      updateDictionarySentence(dictionaryId, sentenceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.detail(dictionaryId) });
    }
  });
}

export function useTranslateDictionarySentence() {
  return useMutation({
    mutationFn: (payload: TranslateRequest) => translateText(payload)
  });
}
