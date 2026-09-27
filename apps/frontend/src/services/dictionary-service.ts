import { apiClient } from "@/lib/api-client";
import type {
  CreateDictionaryRequest,
  CreateDictionarySentenceRequest,
  CreateDictionaryTermRequest,
  Dictionary,
  DictionaryDetail,
  DictionarySentence,
  DictionaryTerm,
  ListDictionarySentencesQuery,
  TranslateDictionarySentenceRequest,
  TranslateDictionarySentenceResult,
  UpdateDictionaryRequest,
  UpdateDictionarySentenceRequest,
  UpdateDictionaryTermRequest
} from "@orange/shared-types";

export async function listDictionaries() {
  const { data } = await apiClient.get<Dictionary[]>("/dictionaries");
  return data;
}

export async function createDictionary(payload: CreateDictionaryRequest) {
  const { data } = await apiClient.post<Dictionary>("/dictionaries", payload);
  return data;
}

export async function getDictionary(id: string) {
  const { data } = await apiClient.get<DictionaryDetail>(`/dictionaries/${id}`);
  return data;
}

export async function updateDictionary(id: string, payload: UpdateDictionaryRequest) {
  const { data } = await apiClient.patch<Dictionary>(`/dictionaries/${id}`, payload);
  return data;
}

export async function deleteDictionary(id: string) {
  const { data } = await apiClient.delete<{ success: boolean }>(`/dictionaries/${id}`);
  return data;
}

export async function createDictionaryTerm(dictionaryId: string, payload: CreateDictionaryTermRequest) {
  const { data } = await apiClient.post<DictionaryTerm>(`/dictionaries/${dictionaryId}/terms`, payload);
  return data;
}

export async function updateDictionaryTerm(dictionaryId: string, termId: string, payload: UpdateDictionaryTermRequest) {
  const { data } = await apiClient.patch<DictionaryTerm>(`/dictionaries/${dictionaryId}/terms/${termId}`, payload);
  return data;
}

export async function deleteDictionaryTerm(dictionaryId: string, termId: string) {
  const { data } = await apiClient.delete<{ success: boolean }>(`/dictionaries/${dictionaryId}/terms/${termId}`);
  return data;
}

export async function createDictionarySentence(dictionaryId: string, payload: CreateDictionarySentenceRequest) {
  const { data } = await apiClient.post<DictionarySentence>(`/dictionaries/${dictionaryId}/sentences`, payload);
  return data;
}

export async function listDictionarySentences(dictionaryId: string, query: ListDictionarySentencesQuery) {
  const { data } = await apiClient.get<DictionarySentence[]>(`/dictionaries/${dictionaryId}/sentences`, {
    params: query
  });
  return data;
}

export async function updateDictionarySentence(
  dictionaryId: string,
  sentenceId: string,
  payload: UpdateDictionarySentenceRequest
) {
  const { data } = await apiClient.patch<DictionarySentence>(
    `/dictionaries/${dictionaryId}/sentences/${sentenceId}`,
    payload
  );
  return data;
}

export async function translateDictionarySentence(
  dictionaryId: string,
  payload: TranslateDictionarySentenceRequest
) {
  const { data } = await apiClient.post<TranslateDictionarySentenceResult>(
    `/dictionaries/${dictionaryId}/translations`,
    payload
  );
  return data;
}
