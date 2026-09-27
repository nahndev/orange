"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type {
  CreateDictionaryRequest,
  CreateDictionarySentenceRequest,
  CreateDictionaryTermRequest,
  ListDictionarySentencesQuery,
  TranslateDictionarySentenceRequest,
  UpdateDictionaryRequest,
  UpdateDictionarySentenceRequest,
  UpdateDictionaryTermRequest
} from "@orange/shared-types";
import {
  createDictionary,
  createDictionarySentence,
  createDictionaryTerm,
  deleteDictionary,
  deleteDictionaryTerm,
  getDictionary,
  listDictionaries,
  listDictionarySentences,
  translateDictionarySentence,
  updateDictionary,
  updateDictionarySentence,
  updateDictionaryTerm
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

export function useCreateDictionaryTerm(dictionaryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDictionaryTermRequest) => createDictionaryTerm(dictionaryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.detail(dictionaryId) });
    }
  });
}

export function useUpdateDictionaryTerm(dictionaryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ termId, data }: { termId: string; data: UpdateDictionaryTermRequest }) =>
      updateDictionaryTerm(dictionaryId, termId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dictionaryKeys.detail(dictionaryId) });
    }
  });
}

export function useDeleteDictionaryTerm(dictionaryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (termId: string) => deleteDictionaryTerm(dictionaryId, termId),
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

export function useTranslateDictionarySentence(dictionaryId: string) {
  return useMutation({
    mutationFn: (payload: TranslateDictionarySentenceRequest) => translateDictionarySentence(dictionaryId, payload)
  });
}
