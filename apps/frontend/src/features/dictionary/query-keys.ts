export const dictionaryKeys = {
  all: ["dictionaries"] as const,
  list: () => [...dictionaryKeys.all, "list"] as const,
  detail: (id: string) => [...dictionaryKeys.all, "detail", id] as const
};
