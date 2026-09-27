import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DictionaryDetailsForm } from "@/features/dictionary/components/dictionary-details-form";
import { DictionaryEntries } from "@/features/dictionary/components/dictionary-entries";
import { DictionaryLanguagesForm } from "@/features/dictionary/components/dictionary-languages-form";

interface DictionaryDetailPageProps {
  params: { key: string };
}

export default function DictionaryDetailPage({ params }: DictionaryDetailPageProps) {
  const dictionaryId = params.key;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Name and description for this dictionary.</CardDescription>
          </CardHeader>
          <CardContent>
            <DictionaryDetailsForm dictionaryId={dictionaryId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Languages</CardTitle>
            <CardDescription>Configure the languages this dictionary supports and its default language.</CardDescription>
          </CardHeader>
          <CardContent>
            <DictionaryLanguagesForm dictionaryId={dictionaryId} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Keywords</CardTitle>
          <CardDescription>Manage translated keywords for this dictionary.</CardDescription>
        </CardHeader>
        <CardContent>
          <DictionaryEntries dictionaryId={dictionaryId} />
        </CardContent>
      </Card>
    </div>
  );
}
