import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { DictionaryTranslationWorkspace } from "@/features/dictionary/components/dictionary-translation-workspace";

interface AddDictionaryTranslationPageProps {
  params: { id: string };
}

export default async function AddDictionaryTranslationPage({ params }: AddDictionaryTranslationPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <DictionaryTranslationWorkspace dictionaryId={params.id} />
    </main>
  );
}
