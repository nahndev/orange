"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeleteDictionary, useDictionary, useUpdateDictionary } from "../hooks";

export function DictionaryDetailsForm({ dictionaryId }: { dictionaryId: string }) {
  const { data: dictionary, isLoading, error } = useDictionary(dictionaryId);
  const updateDictionary = useUpdateDictionary(dictionaryId);
  const deleteDictionary = useDeleteDictionary();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (dictionary) {
      setName(dictionary.name);
      setDescription(dictionary.description ?? "");
    }
  }, [dictionary]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateDictionary.mutate({ name, description });
  }

  function handleDelete() {
    deleteDictionary.mutate(dictionaryId, {
      onSuccess: () => router.push("/dashboard/dictionaries")
    });
  }

  if (isLoading && !dictionary) {
    return <p className="text-sm text-slate-500">Loading dictionary...</p>;
  }

  if (error && !dictionary) {
    return <p className="text-sm text-red-600">Failed to load dictionary.</p>;
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dictionary-detail-name">Name</Label>
        <Input id="dictionary-detail-name" value={name} onChange={(event) => setName(event.target.value)} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dictionary-detail-description">Description</Label>
        <Input
          id="dictionary-detail-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      {updateDictionary.isError ? <p className="text-sm text-red-600">Failed to save changes.</p> : null}
      {updateDictionary.isSuccess ? <p className="text-sm text-emerald-600">Dictionary updated.</p> : null}
      <div className="flex items-center justify-between">
        <Button type="submit" disabled={updateDictionary.isPending}>
          {updateDictionary.isPending ? "Saving..." : "Save changes"}
        </Button>
        <Button type="button" variant="outline" onClick={handleDelete} disabled={deleteDictionary.isPending}>
          {deleteDictionary.isPending ? "Deleting..." : "Delete dictionary"}
        </Button>
      </div>
    </form>
  );
}
