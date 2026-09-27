"use client";

import { useEffect, useState } from "react";
import type { DictionaryEntryValues, DictionarySentence } from "@orange/shared-types";
import { SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateDictionarySentence,
  useDictionary,
  useTranslateDictionarySentence,
  useUpdateDictionarySentence
} from "../hooks";
import { LanguageName } from "./language-name";

function findMissingLanguageKeys(languageKeys: string[], values: DictionaryEntryValues): string[] {
  return languageKeys.filter((languageKey) => !values[languageKey]?.trim());
}

interface DictionarySentenceFormProps {
  dictionaryId: string;
  editingSentence?: DictionarySentence | null;
  onEditComplete?: () => void;
}

export function DictionarySentenceForm({ dictionaryId, editingSentence, onEditComplete }: DictionarySentenceFormProps) {
  const { data: dictionary } = useDictionary(dictionaryId);
  const createSentence = useCreateDictionarySentence(dictionaryId);
  const updateSentence = useUpdateDictionarySentence(dictionaryId);
  const translateSentence = useTranslateDictionarySentence(dictionaryId);

  const [values, setValues] = useState<DictionaryEntryValues>({});
  const [missingKeys, setMissingKeys] = useState<string[]>([]);

  useEffect(() => {
    setValues(editingSentence?.values ?? {});
    setMissingKeys([]);
  }, [editingSentence]);

  const languages = dictionary?.languages ?? [];

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
        languages: targetLanguages
      },
      {
        onSuccess: (translations) => {
          setValues((prev) => ({ ...prev, ...translations }));
          setMissingKeys((prev) => prev.filter((languageKey) => !(languageKey in translations)));
        }
      }
    );
  }

  function handleSubmit() {
    const languageKeys = languages.map((language) => language.key);
    const missing = findMissingLanguageKeys(languageKeys, values);
    if (missing.length > 0) {
      setMissingKeys(missing);
      return;
    }

    if (editingSentence) {
      updateSentence.mutate(
        { sentenceId: editingSentence.id, data: { values } },
        {
          onSuccess: () => {
            setValues({});
            setMissingKeys([]);
            onEditComplete?.();
          }
        }
      );
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

  function handleCancel() {
    setValues({});
    setMissingKeys([]);
    onEditComplete?.();
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
        <Button type="button" onClick={handleSubmit} disabled={createSentence.isPending || updateSentence.isPending}>
          {editingSentence ? "Update" : "Add"}
        </Button>
        {editingSentence ? (
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
      {translateSentence.isError ? <p className="text-sm text-red-600">Failed to fill translations.</p> : null}
      {createSentence.isError ? <p className="text-sm text-red-600">Failed to add sentence.</p> : null}
      {updateSentence.isError ? <p className="text-sm text-red-600">Failed to update sentence.</p> : null}
    </div>
  );
}
