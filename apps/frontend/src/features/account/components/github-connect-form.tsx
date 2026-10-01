"use client";

import type { FormEvent, KeyboardEvent } from "react";
import type { GithubConnection, UpdateGithubConnectionRequest } from "@orange/shared-types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGithubSetup } from "./github-setup-provider";

/** Token, repository and branch state lives in GithubSetupProvider. */
export interface GithubConnectFormProps {
  /** Current connection; null when not connected yet. */
  connection: GithubConnection | null;
  /** Whether a token is already stored (then the token field is optional). */
  hasToken: boolean;
  isSaving?: boolean;
  isRemoving?: boolean;
  isChecking?: boolean;
  /** Result of the last health check; undefined when not checked. */
  isHealthy?: boolean;
  errorMessage?: string;
  onSubmit: (values: UpdateGithubConnectionRequest) => void;
  onRemove?: () => void;
  onCheck?: () => void;
}

export function GithubConnectForm({
  connection,
  hasToken,
  isSaving = false,
  isRemoving = false,
  isChecking = false,
  isHealthy,
  errorMessage,
  onSubmit,
  onRemove,
  onCheck
}: GithubConnectFormProps) {
  const setup = useGithubSetup();
  const repositoryValue = setup.owner && setup.repo ? `${setup.owner}/${setup.repo}` : "";
  const canSubmit = Boolean(setup.owner && setup.repo && setup.branch);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({ owner: setup.owner, repo: setup.repo, branch: setup.branch, token: setup.token || undefined });
  }

  // Enter in the token field loads repositories instead of submitting a half-filled form.
  function handleTokenKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    setup.loadRepositories();
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="github-token">Access token</Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <PasswordInput
              id="github-token"
              value={setup.token}
              onChange={(event) => setup.setToken(event.target.value)}
              onKeyDown={handleTokenKeyDown}
              placeholder={hasToken ? "Leave empty to keep the current token" : "ghp_..."}
              autoComplete="off"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={!setup.token || setup.isLoadingRepositories}
            onClick={setup.loadRepositories}
          >
            {setup.isLoadingRepositories ? "Loading..." : "Load repositories"}
          </Button>
        </div>
        {setup.repositoriesError ? <p className="text-sm text-red-600">{setup.repositoriesError}</p> : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="github-repository">Repository</Label>
        <Select
          value={repositoryValue}
          disabled={setup.repositories.length === 0}
          onValueChange={(next) => {
            const repository = setup.repositories.find((item) => `${item.owner}/${item.name}` === next);
            if (repository) setup.selectRepository(repository);
          }}
        >
          <SelectTrigger id="github-repository" className="w-full">
            <SelectValue>{repositoryValue || "Enter a token to load repositories"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {setup.repositories.map((repository) => (
              <SelectItem key={`${repository.owner}/${repository.name}`} value={`${repository.owner}/${repository.name}`}>
                {repository.owner}/{repository.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="github-branch">Branch</Label>
        <Select
          value={setup.branch}
          disabled={setup.branches.length === 0}
          onValueChange={(next) => setup.selectBranch(next ?? "")}
        >
          <SelectTrigger id="github-branch" className="w-full">
            <SelectValue>
              {setup.isLoadingBranches ? "Loading branches..." : setup.branch || "Select a repository first"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {setup.branches.map((item) => (
              <SelectItem key={item.name} value={item.name}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {setup.branchesError ? <p className="text-sm text-red-600">{setup.branchesError}</p> : null}
      </div>
      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
      {isHealthy === true ? <p className="text-sm text-emerald-600">Connection is healthy.</p> : null}
      {isHealthy === false ? <p className="text-sm text-red-600">Connection check failed.</p> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={isSaving || !canSubmit}>
          {isSaving ? "Saving..." : connection ? "Save changes" : "Connect"}
        </Button>
        {connection && onCheck ? (
          <Button type="button" variant="outline" disabled={isChecking} onClick={onCheck}>
            {isChecking ? "Checking..." : "Check connection"}
          </Button>
        ) : null}
        {connection && onRemove ? (
          <Button type="button" variant="outline" disabled={isRemoving} onClick={onRemove}>
            {isRemoving ? "Disconnecting..." : "Disconnect"}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
