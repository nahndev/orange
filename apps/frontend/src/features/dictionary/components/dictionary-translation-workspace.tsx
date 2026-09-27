"use client";

import { useState } from "react";
import type { DictionarySentence } from "@orange/shared-types";
import { DictionarySentenceForm } from "./dictionary-sentence-form";
import { DictionarySentenceList } from "./dictionary-sentence-list";
import { DictionaryWordReferenceList } from "./dictionary-word-reference-list";

export function DictionaryTranslationWorkspace({ dictionaryId }: { dictionaryId: string }) {
  const [editingSentence, setEditingSentence] = useState<DictionarySentence | null>(null);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-slate-900">
            {editingSentence ? "Update Translation" : "Add Translation"}
          </h1>
          <p className="text-sm text-slate-500">
            Write a sentence and translate it into every configured language. Pre-defined words below are applied
            automatically to keep terminology consistent.
          </p>
          <DictionarySentenceForm
            dictionaryId={dictionaryId}
            editingSentence={editingSentence}
            onEditComplete={() => setEditingSentence(null)}
          />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Pre-defined words</h2>
          <DictionaryWordReferenceList dictionaryId={dictionaryId} />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">Sentences</h2>
        <DictionarySentenceList
          dictionaryId={dictionaryId}
          selectedSentenceId={editingSentence?.id}
          onSelectSentence={setEditingSentence}
        />
      </div>
    </div>
  );
}
