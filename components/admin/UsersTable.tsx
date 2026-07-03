import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import type { Tables } from "@/lib/supabase/types";

export function UsersTable({ users }: { users: Tables<"admin_user_stats">[] }) {
  return (
    <div className="space-y-2">
      {users.map((u) => (
        <Card key={u.id}>
          <CardContent className="flex items-center justify-between gap-3 p-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-semibold">{u.display_name || u.username}</span>
                {u.is_admin && <Badge className="bg-primary text-primary-foreground">Admin</Badge>}
                {u.is_premium && (
                  <Badge className="bg-warning text-warning-foreground">Pro</Badge>
                )}
                {!u.onboarding_complete && <Badge variant="secondary">Onboarding pendente</Badge>}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {u.city ? `${u.city}${u.state ? `, ${u.state}` : ""}` : "Sem cidade"} ·{" "}
                {u.created_at &&
                  new Date(u.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-bold tabular-nums">{formatCurrency(u.gross_earnings ?? 0)}</p>
              <p className="text-xs text-muted-foreground">{u.ride_count ?? 0} corridas</p>
            </div>
          </CardContent>
        </Card>
      ))}
      {users.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhum usuário encontrado.
        </p>
      )}
    </div>
  );
}
