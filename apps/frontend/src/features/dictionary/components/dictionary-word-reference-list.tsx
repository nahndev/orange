"use client";

import { useDictionary } from "../hooks";
import { LanguageName } from "./language-name";

export function DictionaryWordReferenceList({ dictionaryId }: { dictionaryId: string }) {
  const { data: dictionary } = useDictionary(dictionaryId);

  const languages = dictionary?.languages ?? [];
  const entries = dictionary?.entries ?? [];

  if (languages.length === 0 || entries.length === 0) {
    return <p className="text-sm text-slate-500">No pre-defined words yet.</p>;
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
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-slate-100 last:border-b-0">
              <td className="p-3 align-top font-medium text-slate-900">{entry.key}</td>
              <td className="p-3 align-top text-slate-600">{entry.description}</td>
              {languages.map((language) => (
                <td key={language.key} className="p-3 align-top text-slate-600">
                  {entry.values[language.key] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
