"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/community", label: "Feed" },
  { href: "/community/ranking", label: "Ranking" },
  { href: "/community/voice", label: "Voz" },
];

export function CommunityTabs() {
  const pathname = usePathname();
  return (
    <div className="flex gap-1 rounded-lg bg-muted p-1">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "flex-1 rounded-md py-1.5 text-center text-sm font-medium transition-colors",
            pathname === tab.href
              ? "bg-card shadow-sm"
              : "text-muted-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
