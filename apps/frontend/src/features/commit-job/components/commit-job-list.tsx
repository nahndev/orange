"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDictionaries } from "@/features/dictionary";
import { useGithubProfiles } from "@/features/github-profile";
import { useCommitJobConfigs, useDeleteCommitJobConfig, useUpdateCommitJobConfig } from "../hooks";
import { CommitJobRuns } from "./commit-job-runs";

export function CommitJobList() {
  const { data: configs, isLoading, error } = useCommitJobConfigs();
  const { data: dictionaries = [] } = useDictionaries();
  const { data: profiles = [] } = useGithubProfiles();
  const updateConfig = useUpdateCommitJobConfig();
  const deleteConfig = useDeleteCommitJobConfig();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading jobs...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">Failed to load jobs.</p>;
  }

  if (!configs || configs.length === 0) {
    return <p className="text-sm text-slate-500">No commit jobs yet.</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
      {configs.map((config) => {
        const dictionary = dictionaries.find((item) => item.id === config.dictionaryId);
        const profile = profiles.find((item) => item.id === config.connectorId);
        const isExpanded = expandedId === config.id;

        return (
          <div key={config.id} className="flex flex-col gap-3 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-slate-900">{config.name}</span>
                <span className="text-xs text-slate-500">
                  {dictionary?.name ?? "Unknown dictionary"} · {profile ? `${profile.owner}/${profile.repo}@${profile.branch}` : "Unknown profile"} · on sentence change · {config.filePathTemplate}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={config.connectorId}
                  onValueChange={(next) => {
                    if (next && next !== config.connectorId) {
                      updateConfig.mutate({ id: config.id, data: { connectorId: next } });
                    }
                  }}
                >
                  <SelectTrigger aria-label="GitHub profile">
                    <SelectValue>{profile?.name ?? "Unknown profile"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" onClick={() => setExpandedId(isExpanded ? null : config.id)}>
                  {isExpanded ? "Hide runs" : "Runs"}
                </Button>
                <Button
                  variant="outline"
                  disabled={updateConfig.isPending}
                  onClick={() => updateConfig.mutate({ id: config.id, data: { enabled: !config.enabled } })}
                >
                  {config.enabled ? "Disable" : "Enable"}
                </Button>
                <Button
                  variant="ghost"
                  disabled={deleteConfig.isPending}
                  onClick={() => deleteConfig.mutate(config.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
            {isExpanded ? <CommitJobRuns configId={config.id} /> : null}
          </div>
        );
      })}
    </div>
  );
}
