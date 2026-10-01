"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCheckGithubSetupHealth, useCreateGithubProfile } from "../hooks";
import { useGithubSetup } from "./github-setup-provider";

/** Token first, then each selector fills in only when its own load button is clicked. Needs GithubSetupProvider. */
export function GithubProfileForm() {
  const setup = useGithubSetup();
  const createProfile = useCreateGithubProfile();
  const check = useCheckGithubSetupHealth();
  const [name, setName] = useState("");
  const repositoryValue = setup.owner && setup.repo ? `${setup.owner}/${setup.repo}` : "";
  const hasSelection = Boolean(setup.token && setup.owner && setup.repo && setup.branch);
  const canSubmit = Boolean(name && hasSelection);

  // A previous check no longer describes the form once the token, repository or branch changes.
  const { reset: resetCheck } = check;
  useEffect(() => {
    resetCheck();
  }, [setup.token, setup.owner, setup.repo, setup.branch, resetCheck]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    createProfile.mutate(
      { name, owner: setup.owner, repo: setup.repo, branch: setup.branch, token: setup.token },
      {
        onSuccess: () => {
          setName("");
          setup.reset();
        }
      }
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="github-profile-name">Profile name</Label>
        <Input
          id="github-profile-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Marketing site"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="github-token">Access token</Label>
        <PasswordInput
          id="github-token"
          value={setup.token}
          onChange={(event) => setup.setToken(event.target.value)}
          placeholder="ghp_..."
          autoComplete="off"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="github-repository">Repository</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            disabled={!setup.token || setup.isLoadingRepositories}
            onClick={setup.loadRepositories}
          >
            {setup.isLoadingRepositories ? "Loading..." : "Load repositories"}
          </Button>
          <div className="flex-1">
            <Select
              value={repositoryValue}
              disabled={setup.repositories.length === 0}
              onValueChange={(next) => {
                const repository = setup.repositories.find((item) => `${item.owner}/${item.name}` === next);
                if (repository) setup.selectRepository(repository);
              }}
            >
              <SelectTrigger id="github-repository" className="w-full">
                <SelectValue>{repositoryValue || "Select repository"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {setup.repositories.map((repository) => (
                  <SelectItem
                    key={`${repository.owner}/${repository.name}`}
                    value={`${repository.owner}/${repository.name}`}
                  >
                    {repository.owner}/{repository.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {setup.repositoriesError ? <p className="text-sm text-red-600">{setup.repositoriesError}</p> : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="github-branch">Branch</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            disabled={!setup.repo || setup.isLoadingBranches}
            onClick={setup.loadBranches}
          >
            {setup.isLoadingBranches ? "Loading..." : "Load branches"}
          </Button>
          <div className="flex-1">
            <Select
              value={setup.branch}
              disabled={setup.branches.length === 0}
              onValueChange={(next) => setup.selectBranch(next ?? "")}
            >
              <SelectTrigger id="github-branch" className="w-full">
                <SelectValue>{setup.branch || "Select branch"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {setup.branches.map((item) => (
                  <SelectItem key={item.name} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {setup.branchesError ? <p className="text-sm text-red-600">{setup.branchesError}</p> : null}
      </div>
      {check.data?.healthy === true ? <p className="text-sm text-emerald-600">Connection is healthy.</p> : null}
      {check.data?.healthy === false ? <p className="text-sm text-red-600">Connection check failed.</p> : null}
      {check.isError ? <p className="text-sm text-red-600">{check.error.message}</p> : null}
      {createProfile.isError ? <p className="text-sm text-red-600">{createProfile.error.message}</p> : null}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!hasSelection || check.isPending}
          onClick={() =>
            check.mutate({ token: setup.token, owner: setup.owner, repo: setup.repo, branch: setup.branch })
          }
        >
          {check.isPending ? "Checking..." : "Check connection"}
        </Button>
        <Button type="submit" disabled={createProfile.isPending || !canSubmit}>
          {createProfile.isPending ? "Saving..." : "Create profile"}
        </Button>
      </div>
    </form>
  );
}
