"use client";

import { DashboardLogo, Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard/dictionaries", label: "Dictionaries" },
  { href: "/dashboard/commit-jobs", label: "Jobs" },
];

export function DashboardHeader({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-6 border-b border-slate-200 bg-white px-6">
      <DashboardLogo />
      <nav className="flex flex-1 items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100",
                isActive && "bg-slate-900 text-white hover:bg-slate-900",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          {userName}
        </Link>
        <Button
          variant="outline"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Sign out
        </Button>
      </div>
    </header>
  );
}

export function AuthHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-6 border-b border-slate-200 bg-white px-6">
      <Logo />
    </header>
  );
}
