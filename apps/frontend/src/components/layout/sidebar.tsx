"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dictionaries", label: "Dictionaries" },
  { href: "/languages", label: "Languages" },
  { href: "/commit-jobs", label: "Jobs" }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col gap-1 border-r border-slate-200 bg-white p-4">
      <div className="mb-4 px-2 text-lg font-semibold text-slate-900">Orange</div>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100",
              isActive && "bg-slate-900 text-white hover:bg-slate-900"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
