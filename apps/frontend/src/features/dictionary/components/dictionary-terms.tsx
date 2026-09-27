"use client";

import { useState } from "react";
import type { DictionaryLanguage, DictionaryTerm, DictionaryTermValues } from "@orange/shared-types";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateDictionaryTerm, useDeleteDictionaryTerm, useDictionary, useUpdateDictionaryTerm } from "../hooks";
import { LanguageName } from "./language-name";

function findMissingLanguageKeys(languageKeys: string[], values: DictionaryTermValues): string[] {
  return languageKeys.filter((languageKey) => !values[languageKey]?.trim());
}

export function DictionaryTerms({ dictionaryId }: { dictionaryId: string }) {
  const { data: dictionary } = useDictionary(dictionaryId);

  const languages = dictionary?.languages ?? [];
  const terms = dictionary?.terms ?? [];

  if (languages.length === 0) {
    return <p className="text-sm text-slate-500">Configure at least one language before adding keywords.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="p-3 text-left font-medium text-slate-700">Key</th>
            <th className="p-3 text-left font-medium text-slate-700">Description</th>
            {languages.map((language) => (
              <th key={language.key} className="p-3 text-left font-medium text-slate-700">
                <LanguageName country={language.country} />
              </th>
            ))}
            <th className="w-12 p-3" />
          </tr>
        </thead>
        <tbody>
          {terms.length === 0 ? (
            <tr>
              <td className="p-3 text-sm text-slate-500" colSpan={languages.length + 3}>
                No keywords yet.
              </td>
            </tr>
          ) : (
            terms.map((term) => (
              <DictionaryTermRow key={term.id} dictionaryId={dictionaryId} term={term} languages={languages} />
            ))
          )}
          <NewDictionaryTermRow dictionaryId={dictionaryId} languages={languages} />
        </tbody>
      </table>
    </div>
  );
}

function DictionaryTermRow({
  dictionaryId,
  term,
  languages
}: {
  dictionaryId: string;
  term: DictionaryTerm;
  languages: DictionaryLanguage[];
}) {
  const updateTerm = useUpdateDictionaryTerm(dictionaryId);
  const deleteTerm = useDeleteDictionaryTerm(dictionaryId);

  const [description, setDescription] = useState(term.description ?? "");
  const [values, setValues] = useState<DictionaryTermValues>(term.values);
  const [missingKeys, setMissingKeys] = useState<string[]>([]);

  function handleBlur() {
    const languageKeys = languages.map((language) => language.key);
    const missing = findMissingLanguageKeys(languageKeys, values);
    if (missing.length > 0) {
      setMissingKeys(missing);
      return;
    }

    if (description === (term.description ?? "") && JSON.stringify(values) === JSON.stringify(term.values)) {
      return;
    }

    updateTerm.mutate({ termId: term.id, data: { description: description || undefined, values } });
  }

  return (
    <tr className="border-b border-slate-100 last:border-b-0">
      <td className="p-3 align-top font-medium text-slate-900">{term.key}</td>
      <td className="p-3 align-top">
        <Input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          onBlur={handleBlur}
        />
      </td>
      {languages.map((language) => {
        const isMissing = missingKeys.includes(language.key);
        return (
          <td key={language.key} className="p-3 align-top">
            <Input
              value={values[language.key] ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                setValues((prev) => ({ ...prev, [language.key]: value }));
                setMissingKeys((prev) => prev.filter((key) => key !== language.key));
              }}
              onBlur={handleBlur}
              className={isMissing ? "border-red-500" : undefined}
            />
            {isMissing ? <p className="text-sm text-red-600">Translation is required.</p> : null}
          </td>
        );
      })}
      <td className="p-3 align-top">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => deleteTerm.mutate(term.id)}
          disabled={deleteTerm.isPending}
          aria-label="Delete keyword"
        >
          <Trash2Icon />
        </Button>
      </td>
    </tr>
  );
}

function NewDictionaryTermRow({
  dictionaryId,
  languages
}: {
  dictionaryId: string;
  languages: DictionaryLanguage[];
}) {
  const createTerm = useCreateDictionaryTerm(dictionaryId);

  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [values, setValues] = useState<DictionaryTermValues>({});
  const [missingKeys, setMissingKeys] = useState<string[]>([]);

  function handleCreate() {
    const languageKeys = languages.map((language) => language.key);
    const missing = findMissingLanguageKeys(languageKeys, values);
    if (!key.trim() || missing.length > 0) {
      setMissingKeys(missing);
      return;
    }

    createTerm.mutate(
      { key, description: description || undefined, values },
      {
        onSuccess: () => {
          setKey("");
          setDescription("");
          setValues({});
          setMissingKeys([]);
        }
      }
    );
  }

  return (
    <tr className="bg-slate-50/50">
      <td className="p-3 align-top">
        <Input value={key} onChange={(event) => setKey(event.target.value)} placeholder="Key" />
      </td>
      <td className="p-3 align-top">
        <Input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description"
        />
      </td>
      {languages.map((language) => {
        const isMissing = missingKeys.includes(language.key);
        return (
          <td key={language.key} className="p-3 align-top">
            <Input
              value={values[language.key] ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                setValues((prev) => ({ ...prev, [language.key]: value }));
                setMissingKeys((prev) => prev.filter((k) => k !== language.key));
              }}
              placeholder="Translation"
              className={isMissing ? "border-red-500" : undefined}
            />
          </td>
        );
      })}
      <td className="p-3 align-top">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-primary hover:bg-primary/10 hover:text-primary"
          onClick={handleCreate}
          disabled={createTerm.isPending}
          aria-label="Add keyword"
        >
          <PlusIcon />
        </Button>
        {createTerm.isError ? <p className="text-sm text-red-600">Failed to add keyword.</p> : null}
      </td>
    </tr>
  );
}
