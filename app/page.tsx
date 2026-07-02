"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppHydrated } from "@/lib/useAppHydrated";
import { useCurrentProfile } from "@/stores/authStore";

export default function RootPage() {
  const router = useRouter();
  const hydrated = useAppHydrated();
  const profile = useCurrentProfile();

  useEffect(() => {
    if (!hydrated) return;
    if (!profile) {
      router.replace("/login");
    } else if (!profile.onboardingComplete) {
      router.replace("/onboarding");
    } else {
      router.replace("/dashboard");
    }
  }, [hydrated, profile, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-navy">
      <p className="text-white/70 text-sm">Carregando oDriver…</p>
    </div>
  );
}
