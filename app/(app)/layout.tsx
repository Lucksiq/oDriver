import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapProfileRow } from "@/lib/supabase/mappers";
import { AuthProvider } from "@/providers/AuthProvider";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profileRow) {
    redirect("/login");
  }

  if (!profileRow.onboarding_complete) {
    redirect("/onboarding");
  }

  const profile = mapProfileRow(profileRow, user);

  return (
    <AuthProvider initialUser={user} initialProfile={profile}>
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="mx-auto w-full max-w-lg flex-1 px-4 py-4 pb-24">
          {children}
        </main>
        <BottomNav />
      </div>
    </AuthProvider>
  );
}
