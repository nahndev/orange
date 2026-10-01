"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { GithubBranch, GithubRepository } from "@orange/shared-types";
import { useGithubBranches, useGithubRepositories } from "../hooks";

interface GithubSetupContextValue {
  token: string;
  setToken: (token: string) => void;
  /** Loads the repositories reachable with the typed token. Only runs on this call. */
  loadRepositories: () => void;
  repositories: GithubRepository[];
  isLoadingRepositories: boolean;
  repositoriesError?: string;
  owner: string;
  repo: string;
  selectRepository: (repository: GithubRepository) => void;
  /** Loads the branches of the selected repository. Only runs on this call. */
  loadBranches: () => void;
  branch: string;
  selectBranch: (branch: string) => void;
  branches: GithubBranch[];
  isLoadingBranches: boolean;
  branchesError?: string;
  /** Back to the first step: no token, no repository, no branch. */
  reset: () => void;
}

const GithubSetupContext = createContext<GithubSetupContextValue | null>(null);

export function GithubSetupProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState("");
  const [appliedToken, setAppliedToken] = useState("");
  // Revisions only ever grow, so each click is a fresh query key and never reuses another token's cache.
  const [repositoriesRevision, setRepositoriesRevision] = useState(0);
  const [branchesRevision, setBranchesRevision] = useState(0);
  const [hasLoadedRepositories, setHasLoadedRepositories] = useState(false);
  const [hasLoadedBranches, setHasLoadedBranches] = useState(false);
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("");

  const repositoriesQuery = useGithubRepositories({
    token: appliedToken,
    revision: repositoriesRevision,
    enabled: hasLoadedRepositories
  });
  const branchesQuery = useGithubBranches({
    token: appliedToken,
    revision: branchesRevision,
    enabled: hasLoadedBranches,
    owner,
    repo
  });

  const value = useMemo<GithubSetupContextValue>(
    () => ({
      token,
      setToken,
      loadRepositories: () => {
        if (!token) return;
        setAppliedToken(token);
        setRepositoriesRevision((current) => current + 1);
        setHasLoadedRepositories(true);
        setHasLoadedBranches(false);
        setOwner("");
        setRepo("");
        setBranch("");
      },
      repositories: hasLoadedRepositories ? (repositoriesQuery.data ?? []) : [],
      isLoadingRepositories: repositoriesQuery.isFetching,
      repositoriesError: repositoriesQuery.error?.message,
      owner,
      repo,
      selectRepository: (repository) => {
        setOwner(repository.owner);
        setRepo(repository.name);
        setBranch(repository.defaultBranch);
        setHasLoadedBranches(false);
      },
      loadBranches: () => {
        if (!owner || !repo) return;
        setBranchesRevision((current) => current + 1);
        setHasLoadedBranches(true);
      },
      branch,
      selectBranch: setBranch,
      branches: hasLoadedBranches ? (branchesQuery.data ?? []) : [],
      isLoadingBranches: branchesQuery.isFetching,
      branchesError: branchesQuery.error?.message,
      reset: () => {
        setToken("");
        setAppliedToken("");
        setHasLoadedRepositories(false);
        setHasLoadedBranches(false);
        setOwner("");
        setRepo("");
        setBranch("");
      }
    }),
    [token, owner, repo, branch, hasLoadedRepositories, hasLoadedBranches, repositoriesQuery, branchesQuery]
  );

  return <GithubSetupContext.Provider value={value}>{children}</GithubSetupContext.Provider>;
}

export function useGithubSetup() {
  const context = useContext(GithubSetupContext);
  if (!context) {
    throw new Error("useGithubSetup must be used within GithubSetupProvider");
  }

  return context;
}
