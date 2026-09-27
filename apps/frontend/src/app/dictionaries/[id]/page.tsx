import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { DictionarySentenceForm } from "@/features/dictionary/components/dictionary-sentence-form";
import { DictionaryWordReferenceList } from "@/features/dictionary/components/dictionary-word-reference-list";

interface AddDictionaryTranslationPageProps {
  params: { id: string };
}

export default async function AddDictionaryTranslationPage({ params }: AddDictionaryTranslationPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-slate-900">Add Translation</h1>
        <p className="text-sm text-slate-500">
          Write a sentence and translate it into every configured language. Pre-defined words below are applied
          automatically to keep terminology consistent.
        </p>
        <DictionarySentenceForm dictionaryId={params.id} />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">Pre-defined words</h2>
        <DictionaryWordReferenceList dictionaryId={params.id} />
      </div>
    </main>
  );
}
