"use client";

import { useState } from "react";
import type { DictionarySentence } from "@orange/shared-types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDictionary, useDictionarySentences } from "../hooks";
import { LanguageName } from "./language-name";

const ALL_LANGUAGES = "__all__";

interface DictionarySentenceListProps {
  dictionaryId: string;
  selectedSentenceId?: string;
  onSelectSentence: (sentence: DictionarySentence) => void;
}

export function DictionarySentenceList({
  dictionaryId,
  selectedSentenceId,
  onSelectSentence
}: DictionarySentenceListProps) {
  const { data: dictionary } = useDictionary(dictionaryId);
  const [language, setLanguage] = useState(ALL_LANGUAGES);
  const [text, setText] = useState("");

  const languages = dictionary?.languages ?? [];
  const selectedLanguage = language === ALL_LANGUAGES ? undefined : language;
  const selectedLanguageCountry = languages.find((item) => item.key === selectedLanguage)?.country;

  const { data: sentences, isLoading } = useDictionarySentences(dictionaryId, {
    language: selectedLanguage,
    q: selectedLanguage && text.trim() ? text.trim() : undefined
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Select value={language} onValueChange={(value) => value && setLanguage(value)}>
          <SelectTrigger className="w-40">
            <SelectValue>
              {selectedLanguageCountry ? <LanguageName country={selectedLanguageCountry} /> : "All languages"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_LANGUAGES}>All languages</SelectItem>
            {languages.map((item) => (
              <SelectItem key={item.key} value={item.key}>
                <LanguageName country={item.country} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={selectedLanguage ? "Search sentence text" : "Select a language to search text"}
          disabled={!selectedLanguage}
        />
      </div>

      {isLoading ? <p className="text-sm text-slate-500">Loading sentences...</p> : null}
      {!isLoading && (sentences?.length ?? 0) === 0 ? (
        <p className="text-sm text-slate-500">No sentences found.</p>
      ) : null}

      <ul className="flex max-h-[32rem] flex-col gap-1 overflow-y-auto">
        {sentences?.map((sentence) => (
          <li key={sentence.id}>
            <button
              type="button"
              onClick={() => onSelectSentence(sentence)}
              className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                sentence.id === selectedSentenceId
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              {languages.map((item) => (
                <div key={item.key} className="truncate text-slate-700">
                  <span className="mr-1 font-medium text-slate-500">
                    <LanguageName country={item.country} />:
                  </span>
                  {sentence.values[item.key] ?? ""}
                </div>
              ))}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
