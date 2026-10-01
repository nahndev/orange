import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GithubProfileForm } from "@/features/github-profile/components/github-profile-form";
import { GithubProfileList } from "@/features/github-profile/components/github-profile-list";
import { GithubSetupProvider } from "@/features/github-profile/components/github-setup-provider";

export default function TokenPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>GitHub profiles</CardTitle>
          <CardDescription>Check the connection of a profile or delete the ones no job uses.</CardDescription>
        </CardHeader>
        <CardContent>
          <GithubProfileList />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New GitHub profile</CardTitle>
          <CardDescription>
            A profile is one repository and one branch reachable with an access token. Profiles are shared by the
            whole application and are used by commit jobs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GithubSetupProvider>
            <GithubProfileForm />
          </GithubSetupProvider>
        </CardContent>
      </Card>
    </div>
  );
}
