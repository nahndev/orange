export const accountKeys = {
  all: ["account"] as const,
  profile: () => [...accountKeys.all, "profile"] as const,
  github: () => [...accountKeys.all, "github"] as const,
  // `revision` stands in for the token so it never ends up in a query key.
  githubRepositories: (revision: number) => [...accountKeys.github(), "repositories", revision] as const,
  githubBranches: (owner: string, repo: string, revision: number) =>
    [...accountKeys.github(), "branches", owner, repo, revision] as const
};
