export const githubProfileKeys = {
  all: ["github-profiles"] as const,
  list: () => [...githubProfileKeys.all, "list"] as const,
  // `revision` stands in for the token so it never ends up in a query key.
  repositories: (revision: number) => [...githubProfileKeys.all, "repositories", revision] as const,
  branches: (owner: string, repo: string, revision: number) =>
    [...githubProfileKeys.all, "branches", owner, repo, revision] as const
};
