"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppHydrated } from "@/lib/useAppHydrated";
import { useCurrentProfile } from "@/stores/authStore";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hydrated = useAppHydrated();
  const profile = useCurrentProfile();

  useEffect(() => {
    if (!hydrated) return;
    if (!profile) {
      router.replace("/login");
    } else if (!profile.onboardingComplete) {
      router.replace("/onboarding");
    }
  }, [hydrated, profile, router]);

  if (!hydrated || !profile || !profile.onboardingComplete) {
    return (
      <div className="mx-auto w-full max-w-lg space-y-4 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-4 pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
