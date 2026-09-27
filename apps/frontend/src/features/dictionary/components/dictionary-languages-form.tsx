"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES } from "@orange/language";
import type { DictionaryLanguage } from "@orange/shared-types";
import { useEffect, useState, type FormEvent } from "react";
import { useDictionary, useUpdateDictionary } from "../hooks";
import { LanguageSelect } from "./language-select";

export function DictionaryLanguagesForm({
  dictionaryId,
}: {
  dictionaryId: string;
}) {
  const { data: dictionary } = useDictionary(dictionaryId);
  const updateDictionary = useUpdateDictionary(dictionaryId);

  const [languages, setLanguages] = useState<DictionaryLanguage[]>([]);
  const [defaultLanguageKey, setDefaultLanguageKey] = useState("");

  useEffect(() => {
    if (dictionary) {
      setLanguages(dictionary.languages);
      setDefaultLanguageKey(dictionary.defaultLanguageKey ?? "");
    }
  }, [dictionary]);

  function updateLanguage(index: number, patch: Partial<DictionaryLanguage>) {
    setLanguages((prev) =>
      prev.map((language, i) =>
        i === index ? { ...language, ...patch } : language,
      ),
    );
  }

  function addLanguage() {
    setLanguages((prev) => [...prev, { key: "", country: COUNTRIES[0].code }]);
  }

  function removeLanguage(index: number) {
    setLanguages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateDictionary.mutate({
      languages,
      defaultLanguageKey: defaultLanguageKey || undefined,
    });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3">
        {languages.map((language, index) => (
          <div key={index} className="flex items-end gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor={`language-key-${index}`}>Language key</Label>
              <Input
                id={`language-key-${index}`}
                value={language.key}
                onChange={(event) =>
                  updateLanguage(index, { key: event.target.value })
                }
                placeholder="e.g. en"
                required
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor={`language-country-${index}`}>Country</Label>
              <LanguageSelect
                id={`language-country-${index}`}
                className="w-40"
                value={language.country}
                onValueChange={(country) => updateLanguage(index, { country })}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => removeLanguage(index)}
            >
              Remove
            </Button>
          </div>
        ))}
        {languages.length === 0 ? (
          <p className="text-sm text-slate-500">No languages configured yet.</p>
        ) : null}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addLanguage}
        className="self-start"
      >
        Add language
      </Button>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="default-language">Default language</Label>
        <Select
          value={defaultLanguageKey}
          onValueChange={(value) => setDefaultLanguageKey(value ?? "")}
        >
          <SelectTrigger id="default-language">
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {languages
              .filter((language) => language.key)
              .map((language) => (
                <SelectItem key={language.key} value={language.key}>
                  {language.key}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {updateDictionary.isError ? (
        <p className="text-sm text-red-600">Failed to save languages.</p>
      ) : null}
      {updateDictionary.isSuccess ? (
        <p className="text-sm text-emerald-600">Languages updated.</p>
      ) : null}

      <Button
        type="submit"
        disabled={updateDictionary.isPending}
        className="self-start"
      >
        {updateDictionary.isPending ? "Saving..." : "Save languages"}
      </Button>
    </form>
  );
}
