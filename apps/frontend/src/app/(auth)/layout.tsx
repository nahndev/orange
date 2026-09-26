import type { ReactNode } from "react";
import { AuthHeader } from "@/components/layout/header";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AuthHeader />
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
