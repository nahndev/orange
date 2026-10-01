"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { GithubConnection, UpdateGithubConnectionRequest } from "@orange/shared-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

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
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("main");
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!connection) return;
    setOwner(connection.owner);
    setRepo(connection.repo);
    setBranch(connection.branch);
  }, [connection]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ owner, repo, branch, token: token || undefined });
    setToken("");
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="github-owner">Owner</Label>
        <Input id="github-owner" value={owner} onChange={(event) => setOwner(event.target.value)} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="github-repo">Repository</Label>
        <Input id="github-repo" value={repo} onChange={(event) => setRepo(event.target.value)} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="github-branch">Branch</Label>
        <Input id="github-branch" value={branch} onChange={(event) => setBranch(event.target.value)} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="github-token">Access token</Label>
        <PasswordInput
          id="github-token"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder={hasToken ? "Leave empty to keep the current token" : "ghp_..."}
          autoComplete="off"
          required={!hasToken}
        />
      </div>
      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
      {isHealthy === true ? <p className="text-sm text-emerald-600">Connection is healthy.</p> : null}
      {isHealthy === false ? <p className="text-sm text-red-600">Connection check failed.</p> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={isSaving}>
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
