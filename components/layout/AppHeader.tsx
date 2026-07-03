"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useCurrentProfile } from "@/providers/AuthProvider";

export function AppHeader() {
  const profile = useCurrentProfile();
  const initials = (profile?.displayName ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b bg-brand-navy px-4 py-3 text-white">
      <div className="mx-auto flex max-w-lg items-center justify-between">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight">
          o<span className="text-primary">Driver</span>
        </Link>
        <div className="flex items-center gap-2">
          {profile?.isPremium && (
            <Badge className="bg-warning text-warning-foreground">Pro</Badge>
          )}
          <Link href="/profile">
            <Avatar className="size-8">
              <AvatarFallback className="bg-white/10 text-white text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
