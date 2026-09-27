"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { useDeleteDictionary, useDictionaries } from "../hooks";

export function DictionaryList() {
  const { data: dictionaries, isLoading, error } = useDictionaries();
  const deleteDictionary = useDeleteDictionary();

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading dictionaries...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">Failed to load dictionaries.</p>;
  }

  if (!dictionaries || dictionaries.length === 0) {
    return <p className="text-sm text-slate-500">No dictionaries yet.</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
      {dictionaries.map((dictionary) => (
        <div key={dictionary.id} className="flex items-center justify-between px-4 py-3">
          <Link href={`/dashboard/dictionaries/${dictionary.id}`} className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-slate-900">{dictionary.name}</span>
            <span className="text-xs text-slate-500">
              {dictionary.languages.length} language{dictionary.languages.length === 1 ? "" : "s"}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href={`/dictionaries/${dictionary.id}`} className={buttonVariants({ variant: "outline" })}>
              Add Translation
            </Link>
            <Button
              variant="ghost"
              onClick={() => deleteDictionary.mutate(dictionary.id)}
              disabled={deleteDictionary.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
