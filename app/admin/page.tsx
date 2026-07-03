import Link from "next/link";
import { redirect } from "next/navigation";
import { subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { UserGrowthChart, type GrowthPoint } from "@/components/admin/UserGrowthChart";
import { UsersTable } from "@/components/admin/UsersTable";
import { formatCurrency } from "@/lib/calculations";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) redirect("/dashboard");

  const { data } = await supabase
    .from("admin_user_stats")
    .select("*")
    .order("created_at", { ascending: false });
  const users = data ?? [];

  const totalUsers = users.length;
  const totalRides = users.reduce((acc, u) => acc + (u.ride_count ?? 0), 0);
  const grossRevenue = users.reduce((acc, u) => acc + Number(u.gross_earnings ?? 0), 0);
  const premiumCount = users.filter((u) => u.is_premium).length;

  const growth: GrowthPoint[] = Array.from({ length: 14 }, (_, i) => {
    const day = subDays(new Date(), 13 - i);
    const dayKey = day.toDateString();
    const novos = users.filter(
      (u) => u.created_at && new Date(u.created_at).toDateString() === dayKey,
    ).length;
    return {
      label: day.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      novos,
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-brand-navy px-4 py-3 text-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <span className="text-lg font-bold tracking-tight">
            o<span className="text-primary">Driver</span> Admin
          </span>
          <Link href="/dashboard" className="text-sm text-white/70 hover:text-white">
            Voltar ao app
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-4">
        <PageHeader title="Painel Admin" subtitle="Visão geral da plataforma" />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Usuários" value={String(totalUsers)} />
          <StatCard label="Corridas" value={String(totalRides)} />
          <StatCard label="Receita bruta" value={formatCurrency(grossRevenue)} tone="success" />
          <StatCard label="Premium" value={String(premiumCount)} tone="warning" />
        </div>

        <div className="mt-4">
          <UserGrowthChart data={growth} />
        </div>

        <div className="mt-4">
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            Todos os usuários ({totalUsers})
          </h2>
          <UsersTable users={users} />
        </div>
      </main>
    </div>
  );
}
