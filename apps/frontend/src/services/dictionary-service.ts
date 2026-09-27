import { apiClient } from "@/lib/api-client";
import type {
  CreateDictionaryEntryRequest,
  CreateDictionaryRequest,
  CreateDictionarySentenceRequest,
  Dictionary,
  DictionaryDetail,
  DictionaryEntry,
  DictionarySentence,
  UpdateDictionaryEntryRequest,
  UpdateDictionaryRequest
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

export async function createDictionaryEntry(dictionaryId: string, payload: CreateDictionaryEntryRequest) {
  const { data } = await apiClient.post<DictionaryEntry>(`/dictionaries/${dictionaryId}/entries`, payload);
  return data;
}

export async function updateDictionaryEntry(dictionaryId: string, entryId: string, payload: UpdateDictionaryEntryRequest) {
  const { data } = await apiClient.patch<DictionaryEntry>(`/dictionaries/${dictionaryId}/entries/${entryId}`, payload);
  return data;
}

export async function deleteDictionaryEntry(dictionaryId: string, entryId: string) {
  const { data } = await apiClient.delete<{ success: boolean }>(`/dictionaries/${dictionaryId}/entries/${entryId}`);
  return data;
}

export async function createDictionarySentence(dictionaryId: string, payload: CreateDictionarySentenceRequest) {
  const { data } = await apiClient.post<DictionarySentence>(`/dictionaries/${dictionaryId}/sentences`, payload);
  return data;
}
