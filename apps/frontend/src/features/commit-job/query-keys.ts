export const commitJobKeys = {
  all: ["commit-jobs"] as const,
  configs: () => [...commitJobKeys.all, "configs"] as const,
  jobs: (configId: string) => [...commitJobKeys.all, "jobs", configId] as const
};
