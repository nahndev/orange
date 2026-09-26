"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile, useUpdateProfile } from "../hooks";

export function ProfileForm() {
  const { data: profile, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();
  const [name, setName] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
    }
  }, [profile]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateProfile.mutate({ name });
  }

  if (isLoading && !profile) {
    return <p className="text-sm text-slate-500">Loading profile...</p>;
  }

  if (error && !profile) {
    return <p className="text-sm text-red-600">Failed to load profile.</p>;
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={profile?.email ?? ""} disabled />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Display name</Label>
        <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      {updateProfile.isError ? <p className="text-sm text-red-600">Failed to save changes.</p> : null}
      {updateProfile.isSuccess ? <p className="text-sm text-emerald-600">Profile updated.</p> : null}
      <Button type="submit" disabled={updateProfile.isPending}>
        {updateProfile.isPending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
