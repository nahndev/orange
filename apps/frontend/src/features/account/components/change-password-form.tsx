"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useChangePassword } from "../hooks";

export function ChangePasswordForm() {
  const changePassword = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
        }
      }
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currentPassword">Current password</Label>
        <PasswordInput
          id="currentPassword"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newPassword">New password</Label>
        <PasswordInput
          id="newPassword"
          autoComplete="new-password"
          required
          minLength={8}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
      </div>
      {changePassword.isError ? (
        <p className="text-sm text-red-600">
          {changePassword.error instanceof Error ? changePassword.error.message : "Failed to change password."}
        </p>
      ) : null}
      {changePassword.isSuccess ? <p className="text-sm text-emerald-600">Password changed.</p> : null}
      <Button type="submit" disabled={changePassword.isPending}>
        {changePassword.isPending ? "Updating..." : "Change password"}
      </Button>
    </form>
  );
}
