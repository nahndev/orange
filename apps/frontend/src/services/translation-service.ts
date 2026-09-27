import { apiClient } from "@/lib/api-client";
import type { TranslateRequest, TranslateResult } from "@orange/shared-types";

export async function translateText(payload: TranslateRequest) {
  const { data } = await apiClient.post<TranslateResult>("/translations", payload);
  return data;
}
