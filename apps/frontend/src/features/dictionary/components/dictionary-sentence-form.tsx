"use client";

import { useState } from "react";
import type { DictionaryEntryValues } from "@orange/shared-types";
import { SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateDictionarySentence, useDictionary, useTranslateDictionarySentence } from "../hooks";
import { LanguageName } from "./language-name";

function findMissingLanguageKeys(languageKeys: string[], values: DictionaryEntryValues): string[] {
  return languageKeys.filter((languageKey) => !values[languageKey]?.trim());
}

function buildGlossaryContext(
  sentence: string,
  entries: { key: string; values: DictionaryEntryValues }[]
): string | undefined {
  const matched = entries.filter((entry) =>
    new RegExp(`\\b${entry.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(sentence)
  );

  if (matched.length === 0) {
    return undefined;
  }

  const hint = matched
    .map(
      (entry) =>
        `${entry.key}: ${Object.entries(entry.values)
          .map(([lang, value]) => `${lang}=${value}`)
          .join(", ")}`
    )
    .join("\n");

  return `Use these exact translations for these terms:\n${hint}`.slice(0, 1000);
}

export function DictionarySentenceForm({ dictionaryId }: { dictionaryId: string }) {
  const { data: dictionary } = useDictionary(dictionaryId);
  const createSentence = useCreateDictionarySentence(dictionaryId);
  const translateSentence = useTranslateDictionarySentence();

  const [values, setValues] = useState<DictionaryEntryValues>({});
  const [missingKeys, setMissingKeys] = useState<string[]>([]);

  const languages = dictionary?.languages ?? [];
  const entries = dictionary?.entries ?? [];

  const sourceLanguage = languages.find((language) => values[language.key]?.trim());

  if (languages.length === 0) {
    return <p className="text-sm text-slate-500">Configure at least one language before adding a sentence.</p>;
  }

  function handleTranslate() {
    const sourceText = sourceLanguage ? values[sourceLanguage.key] : undefined;
    if (!sourceLanguage || !sourceText) {
      return;
    }

    const languageKeys = languages.map((language) => language.key);
    const missing = findMissingLanguageKeys(languageKeys, values);
    const targetLanguages = languages.filter((language) => missing.includes(language.key));

    if (targetLanguages.length === 0) {
      return;
    }

    translateSentence.mutate(
      {
        text: sourceText,
        languages: targetLanguages,
        context: buildGlossaryContext(sourceText, entries)
      },
      {
        onSuccess: (translations) => {
          setValues((prev) => ({ ...prev, ...translations }));
          setMissingKeys((prev) => prev.filter((languageKey) => !(languageKey in translations)));
        }
      }
    );
  }

  function handleAdd() {
    const languageKeys = languages.map((language) => language.key);
    const missing = findMissingLanguageKeys(languageKeys, values);
    if (missing.length > 0) {
      setMissingKeys(missing);
      return;
    }

    createSentence.mutate(
      { values },
      {
        onSuccess: () => {
          setValues({});
          setMissingKeys([]);
        }
      }
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {languages.map((language) => {
        const isMissing = missingKeys.includes(language.key);
        return (
          <div key={language.key} className="flex flex-col gap-1">
            <Label htmlFor={`sentence-${language.key}`}>
              <LanguageName country={language.country} />
            </Label>
            <Input
              id={`sentence-${language.key}`}
              value={values[language.key] ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                setValues((prev) => ({ ...prev, [language.key]: value }));
                setMissingKeys((prev) => prev.filter((key) => key !== language.key));
              }}
              placeholder="Sentence"
              className={isMissing ? "border-red-500" : undefined}
            />
            {isMissing ? <p className="text-sm text-red-600">Translation is required.</p> : null}
          </div>
        );
      })}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleTranslate}
          disabled={!sourceLanguage || translateSentence.isPending}
        >
          <SparklesIcon /> AI
        </Button>
        <Button type="button" onClick={handleAdd} disabled={createSentence.isPending}>
          Add
        </Button>
      </div>
      {translateSentence.isError ? <p className="text-sm text-red-600">Failed to fill translations.</p> : null}
      {createSentence.isError ? <p className="text-sm text-red-600">Failed to add sentence.</p> : null}
    </div>
  );
}
