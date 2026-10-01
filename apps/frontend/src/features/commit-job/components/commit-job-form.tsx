"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGithubProfiles } from "@/features/github-profile";
import { useDictionaries } from "@/features/dictionary";
import { useCreateCommitJobConfig } from "../hooks";

const DEFAULT_FILE_PATH_TEMPLATE = "locales/{language}.json";

export function CommitJobForm() {
  const { data: dictionaries = [] } = useDictionaries();
  const { data: profiles = [] } = useGithubProfiles();
  const createConfig = useCreateCommitJobConfig();
  const [name, setName] = useState("");
  const [dictionaryId, setDictionaryId] = useState("");
  const [connectorId, setConnectorId] = useState("");
  const [filePathTemplate, setFilePathTemplate] = useState(DEFAULT_FILE_PATH_TEMPLATE);

  const selectedDictionary = dictionaries.find((dictionary) => dictionary.id === dictionaryId);
  const selectedProfile = profiles.find((profile) => profile.id === connectorId);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dictionaryId || !connectorId) return;

    createConfig.mutate(
      { name, dictionaryId, connectorId, trigger: "SENTENCE_CHANGED", filePathTemplate },
      {
        onSuccess: () => {
          setName("");
          setFilePathTemplate(DEFAULT_FILE_PATH_TEMPLATE);
        }
      }
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="commit-job-name">Name</Label>
        <Input
          id="commit-job-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Sync marketing site"
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="commit-job-dictionary">Dictionary</Label>
        <Select value={dictionaryId} onValueChange={(next) => setDictionaryId(next ?? "")}>
          <SelectTrigger id="commit-job-dictionary">
            <SelectValue>{selectedDictionary?.name ?? "Select dictionary"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {dictionaries.map((dictionary) => (
              <SelectItem key={dictionary.id} value={dictionary.id}>
                {dictionary.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="commit-job-profile">GitHub profile</Label>
        <Select value={connectorId} onValueChange={(next) => setConnectorId(next ?? "")}>
          <SelectTrigger id="commit-job-profile">
            <SelectValue>
              {selectedProfile ? `${selectedProfile.name} (${selectedProfile.owner}/${selectedProfile.repo})` : "Select profile"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {profiles.map((profile) => (
              <SelectItem key={profile.id} value={profile.id}>
                {profile.name} ({profile.owner}/{profile.repo} · {profile.branch})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {profiles.length === 0 ? (
          <p className="text-xs text-slate-500">
            No GitHub profile yet. Create one in the <Link href="/dashboard/token" className="underline">Token</Link> page.
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="commit-job-trigger">Trigger</Label>
        <Input id="commit-job-trigger" value="When a sentence changes" disabled readOnly />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="commit-job-path">File path</Label>
        <Input
          id="commit-job-path"
          value={filePathTemplate}
          onChange={(event) => setFilePathTemplate(event.target.value)}
          pattern=".*\{language\}.*"
          title="Must contain {language}"
          required
        />
        <p className="text-xs text-slate-500">
          One JSON file per language is committed. {"{language}"} is replaced by the language key.
        </p>
      </div>
      {createConfig.isError ? <p className="text-sm text-red-600">{createConfig.error.message}</p> : null}
      <div>
        <Button type="submit" disabled={createConfig.isPending || !dictionaryId || !connectorId}>
          {createConfig.isPending ? "Creating..." : "Create job"}
        </Button>
      </div>
    </form>
  );
}
