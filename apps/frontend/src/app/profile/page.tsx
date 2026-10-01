import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChangePasswordForm } from "@/features/account/components/change-password-form";
import { GithubConnectionSetup } from "@/features/account/components/github-connection-setup";
import { ProfileForm } from "@/features/account/components/profile-form";

export default function ProfilePage() {
  return (
    <div className="flex max-w-xl mx-auto flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your account details.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Change your account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>GitHub</CardTitle>
          <CardDescription>Connect a GitHub repository to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <GithubConnectionSetup />
        </CardContent>
      </Card>
    </div>
  );
}
