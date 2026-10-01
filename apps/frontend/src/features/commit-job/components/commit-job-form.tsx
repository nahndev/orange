"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDictionaries } from "@/features/dictionary";
import { useCreateCommitJobConfig } from "../hooks";

const DEFAULT_FILE_PATH_TEMPLATE = "locales/{language}.json";

export function CommitJobForm() {
  const { data: dictionaries = [] } = useDictionaries();
  const createConfig = useCreateCommitJobConfig();
  const [name, setName] = useState("");
  const [dictionaryId, setDictionaryId] = useState("");
  const [filePathTemplate, setFilePathTemplate] = useState(DEFAULT_FILE_PATH_TEMPLATE);

  const selectedDictionary = dictionaries.find((dictionary) => dictionary.id === dictionaryId);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dictionaryId) return;

    createConfig.mutate(
      { name, dictionaryId, trigger: "SENTENCE_CHANGED", filePathTemplate },
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
        <Button type="submit" disabled={createConfig.isPending || !dictionaryId}>
          {createConfig.isPending ? "Creating..." : "Create job"}
        </Button>
      </div>
    </form>
  );
}
