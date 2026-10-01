import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CommitJobForm } from "@/features/commit-job/components/commit-job-form";
import { CommitJobList } from "@/features/commit-job/components/commit-job-list";

export default function CommitJobsPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>New commit job</CardTitle>
          <CardDescription>
            When a sentence of the dictionary changes, a merge request with the updated language files is created in
            the repository of the selected GitHub profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CommitJobForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jobs</CardTitle>
          <CardDescription>Enable, disable or review the runs of the commit jobs.</CardDescription>
        </CardHeader>
        <CardContent>
          <CommitJobList />
        </CardContent>
      </Card>
    </div>
  );
}
