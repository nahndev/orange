"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateDictionary } from "../hooks";

export function CreateDictionaryForm() {
  const createDictionary = useCreateDictionary();
  const [name, setName] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createDictionary.mutate({ name }, { onSuccess: () => setName("") });
  }

  return (
    <div className="flex flex-col gap-2">
      <form className="flex items-end gap-3" onSubmit={handleSubmit}>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="dictionary-name">Name</Label>
          <Input
            id="dictionary-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Marketing site"
            required
          />
        </div>
        <Button type="submit" disabled={createDictionary.isPending}>
          {createDictionary.isPending ? "Creating..." : "Create"}
        </Button>
      </form>
      {createDictionary.isError ? <p className="text-sm text-red-600">Failed to create dictionary.</p> : null}
    </div>
  );
}
