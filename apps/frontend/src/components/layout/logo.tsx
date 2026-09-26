import clsx from "clsx";
import Link from "next/link";

export function DashboardLogo() {
  return (
    <Link
      href="/dashboard/dictionaries"
      className={clsx("flex flex-row gap-2 items-end")}
    >
      <h1 className="font-bold text-lg  text-orange-500">Orange</h1>
      <span className="text-xs font-thin text-slate-500">Dashboard</span>
    </Link>
  );
}

export function Logo() {
  return (
    <Link href="/" className={clsx("flex flex-row gap-2 items-end")}>
      <h1 className="font-bold text-lg  text-orange-500">Orange</h1>
      <span className="text-xs font-thin text-slate-500">Translate</span>
    </Link>
  );
}
