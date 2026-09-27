export const dictionaryKeys = {
  all: ["dictionaries"] as const,
  list: () => [...dictionaryKeys.all, "list"] as const,
  detail: (id: string) => [...dictionaryKeys.all, "detail", id] as const,
  sentences: (id: string, filters: { language?: string; q?: string }) =>
    [...dictionaryKeys.detail(id), "sentences", filters] as const
};
