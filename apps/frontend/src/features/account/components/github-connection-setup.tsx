"use client";

import {
  useCheckGithubHealth,
  useGithubConnection,
  useRemoveGithubConnection,
  useUpdateGithubConnection
} from "../hooks";
import { GithubConnectForm } from "./github-connect-form";
import { GithubSetupProvider } from "./github-setup-provider";

export function GithubConnectionSetup() {
  const { data: status, isLoading, error } = useGithubConnection();
  const update = useUpdateGithubConnection();
  const remove = useRemoveGithubConnection();
  const check = useCheckGithubHealth();

  if (isLoading && !status) {
    return <p className="text-sm text-slate-500">Loading GitHub connection...</p>;
  }

  if (error && !status) {
    return <p className="text-sm text-red-600">Failed to load GitHub connection.</p>;
  }

  const failure = update.isError || remove.isError;

  const connection = status?.connection ?? null;
  const hasToken = status?.hasToken ?? false;

  return (
    <GithubSetupProvider connection={connection} hasToken={hasToken}>
      <GithubConnectForm
        connection={connection}
        hasToken={hasToken}
        isSaving={update.isPending}
        isRemoving={remove.isPending}
        isChecking={check.isPending}
        isHealthy={check.data?.healthy}
        errorMessage={failure ? "Failed to update GitHub connection." : undefined}
        onSubmit={(values) => {
          check.reset();
          update.mutate(values);
        }}
        onRemove={() => {
          check.reset();
          remove.mutate();
        }}
        onCheck={() => check.mutate()}
      />
    </GithubSetupProvider>
  );
}
