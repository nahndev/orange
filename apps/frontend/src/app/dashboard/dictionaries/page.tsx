import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateDictionaryForm } from "@/features/dictionary/components/create-dictionary-form";
import { DictionaryList } from "@/features/dictionary/components/dictionary-list";

export default function DictionariesPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>New dictionary</CardTitle>
          <CardDescription>Create a dictionary to start managing translated keywords.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateDictionaryForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dictionaries</CardTitle>
          <CardDescription>Select a dictionary to manage its languages and keywords.</CardDescription>
        </CardHeader>
        <CardContent>
          <DictionaryList />
        </CardContent>
      </Card>
    </div>
  );
}
