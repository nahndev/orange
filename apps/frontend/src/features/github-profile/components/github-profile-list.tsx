"use client";

import { Button } from "@/components/ui/button";
import { useCheckGithubProfileHealth, useDeleteGithubProfile, useGithubProfiles } from "../hooks";

export function GithubProfileList() {
  const { data: profiles, isLoading, error } = useGithubProfiles();
  const check = useCheckGithubProfileHealth();
  const remove = useDeleteGithubProfile();

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading profiles...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">Failed to load profiles.</p>;
  }

  if (!profiles || profiles.length === 0) {
    return <p className="text-sm text-slate-500">No GitHub profiles yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {profiles.map((profile) => {
          const checked = check.variables === profile.id && check.data !== undefined;

          return (
            <div key={profile.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-slate-900">{profile.name}</span>
                <span className="text-xs text-slate-500">
                  {profile.owner}/{profile.repo} · {profile.branch}
                </span>
                {checked ? (
                  <span className={check.data?.healthy ? "text-xs text-emerald-600" : "text-xs text-red-600"}>
                    {check.data?.healthy ? "Connection is healthy." : "Connection check failed."}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={check.isPending && check.variables === profile.id}
                  onClick={() => check.mutate(profile.id)}
                >
                  {check.isPending && check.variables === profile.id ? "Checking..." : "Check"}
                </Button>
                <Button variant="ghost" disabled={remove.isPending} onClick={() => remove.mutate(profile.id)}>
                  Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      {remove.isError ? <p className="text-sm text-red-600">{remove.error.message}</p> : null}
    </div>
  );
}
