"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const tabs = [
  { href: "/", label: "Entities" },
  { href: "/timeline", label: "Timeline" },
  { href: "/graph", label: "Graph" },
  { href: "/insights", label: "Insights" },
  { href: "/bulk", label: "Bulk" }
];

export function Nav() {
  const path = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/70 backdrop-blur border-t border-white/10">
      <div className="mx-auto max-w-md flex">
        {tabs.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className={clsx(
              "flex-1 py-3 text-center text-sm font-medium",
              path === t.href ? "text-white" : "text-slate-400"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
