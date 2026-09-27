"use client";

import { useState, type FormEvent } from "react";
import type { DictionaryEntry, DictionaryEntryValues } from "@orange/shared-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateDictionaryEntry, useDeleteDictionaryEntry, useDictionary, useUpdateDictionaryEntry } from "../hooks";

export function DictionaryEntries({ dictionaryId }: { dictionaryId: string }) {
  const { data: dictionary } = useDictionary(dictionaryId);
  const createEntry = useCreateDictionaryEntry(dictionaryId);

  const [newKey, setNewKey] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const languages = dictionary?.languages ?? [];
  const entries = dictionary?.entries ?? [];

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createEntry.mutate(
      { key: newKey, description: newDescription || undefined },
      {
        onSuccess: () => {
          setNewKey("");
          setNewDescription("");
        }
      }
    );
  }

  if (languages.length === 0) {
    return <p className="text-sm text-slate-500">Configure at least one language before adding keywords.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {entries.length === 0 ? (
        <p className="text-sm text-slate-500">No keywords yet.</p>
      ) : (
        entries.map((entry) => (
          <DictionaryEntryRow
            key={entry.id}
            dictionaryId={dictionaryId}
            entry={entry}
            languageKeys={languages.map((language) => language.key)}
          />
        ))
      )}

      <form className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4" onSubmit={handleCreate}>
        <p className="text-sm font-medium text-slate-700">Add keyword</p>
        <div className="flex items-end gap-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="new-entry-key">Key</Label>
            <Input id="new-entry-key" value={newKey} onChange={(event) => setNewKey(event.target.value)} required />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="new-entry-description">Description</Label>
            <Input
              id="new-entry-description"
              value={newDescription}
              onChange={(event) => setNewDescription(event.target.value)}
            />
          </div>
          <Button type="submit" disabled={createEntry.isPending}>
            {createEntry.isPending ? "Adding..." : "Add"}
          </Button>
        </div>
        {createEntry.isError ? <p className="text-sm text-red-600">Failed to add keyword.</p> : null}
      </form>
    </div>
  );
}

function DictionaryEntryRow({
  dictionaryId,
  entry,
  languageKeys
}: {
  dictionaryId: string;
  entry: DictionaryEntry;
  languageKeys: string[];
}) {
  const updateEntry = useUpdateDictionaryEntry(dictionaryId);
  const deleteEntry = useDeleteDictionaryEntry(dictionaryId);

  const [description, setDescription] = useState(entry.description ?? "");
  const [values, setValues] = useState<DictionaryEntryValues>(entry.values);

  function handleSave() {
    updateEntry.mutate({ entryId: entry.id, data: { description: description || undefined, values } });
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">{entry.key}</span>
        <Button type="button" variant="ghost" onClick={() => deleteEntry.mutate(entry.id)} disabled={deleteEntry.isPending}>
          Delete
        </Button>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`entry-description-${entry.id}`}>Description</Label>
        <Input
          id={`entry-description-${entry.id}`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {languageKeys.map((languageKey) => (
          <div key={languageKey} className="flex flex-col gap-1.5">
            <Label htmlFor={`entry-${entry.id}-${languageKey}`}>{languageKey}</Label>
            <Input
              id={`entry-${entry.id}-${languageKey}`}
              value={values[languageKey] ?? ""}
              onChange={(event) => setValues((prev) => ({ ...prev, [languageKey]: event.target.value }))}
            />
          </div>
        ))}
      </div>
      {updateEntry.isError ? <p className="text-sm text-red-600">Failed to save keyword.</p> : null}
      <Button type="button" onClick={handleSave} disabled={updateEntry.isPending} className="self-start">
        {updateEntry.isPending ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
