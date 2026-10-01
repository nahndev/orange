"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { GithubBranch, GithubConnection, GithubRepository } from "@orange/shared-types";
import { useGithubBranches, useGithubRepositories } from "../hooks";

interface GithubSetupContextValue {
  token: string;
  setToken: (token: string) => void;
  /** Loads the repositories reachable with the typed token. */
  loadRepositories: () => void;
  repositories: GithubRepository[];
  isLoadingRepositories: boolean;
  repositoriesError?: string;
  owner: string;
  repo: string;
  selectRepository: (repository: GithubRepository) => void;
  branch: string;
  selectBranch: (branch: string) => void;
  branches: GithubBranch[];
  isLoadingBranches: boolean;
  branchesError?: string;
}

const GithubSetupContext = createContext<GithubSetupContextValue | null>(null);

export interface GithubSetupProviderProps {
  /** Current connection; null when not connected yet. */
  connection: GithubConnection | null;
  /** Whether a token is already stored, so lists can load before any token is typed. */
  hasToken: boolean;
  children: ReactNode;
}

export function GithubSetupProvider({ connection, hasToken, children }: GithubSetupProviderProps) {
  const [token, setToken] = useState("");
  const [appliedToken, setAppliedToken] = useState("");
  const [revision, setRevision] = useState(0);
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("");

  useEffect(() => {
    // Once saved, the token lives server-side and the lists fall back to it.
    if (hasToken) setToken("");

    if (connection) {
      setOwner(connection.owner);
      setRepo(connection.repo);
      setBranch(connection.branch);
      return;
    }

    // Disconnected (or never connected): drop everything loaded with the old token.
    setOwner("");
    setRepo("");
    setBranch("");
    if (!hasToken) {
      setToken("");
      setAppliedToken("");
      setRevision(0);
    }
  }, [connection, hasToken]);

  const canLoad = revision > 0 || hasToken;
  const listOptions = { token: appliedToken || undefined, revision, enabled: canLoad };
  const repositoriesQuery = useGithubRepositories(listOptions);
  const branchesQuery = useGithubBranches({ ...listOptions, owner, repo });

  const value = useMemo<GithubSetupContextValue>(
    () => ({
      token,
      setToken,
      loadRepositories: () => {
        if (!token) return;
        setAppliedToken(token);
        setRevision((current) => current + 1);
        setOwner("");
        setRepo("");
        setBranch("");
      },
      repositories: canLoad ? (repositoriesQuery.data ?? []) : [],
      isLoadingRepositories: repositoriesQuery.isFetching,
      repositoriesError: repositoriesQuery.error?.message,
      owner,
      repo,
      selectRepository: (repository) => {
        setOwner(repository.owner);
        setRepo(repository.name);
        setBranch(repository.defaultBranch);
      },
      branch,
      selectBranch: setBranch,
      branches: canLoad ? (branchesQuery.data ?? []) : [],
      isLoadingBranches: branchesQuery.isFetching,
      branchesError: branchesQuery.error?.message,
      clearToken: () => {
        setToken("");
        setAppliedToken("");
      }
    }),
    [token, owner, repo, branch, canLoad, repositoriesQuery, branchesQuery]
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
