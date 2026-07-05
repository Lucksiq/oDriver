"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { BadgeGrid } from "@/components/community/BadgeGrid";
import { useAuth } from "@/providers/AuthProvider";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function ProfilePage() {
  const { profile, updateProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const push = usePushNotifications();

  const initials = (profile?.displayName ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-4">
      <PageHeader title="Perfil" />

      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <Avatar className="size-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-bold">{profile?.displayName}</p>
            <p className="text-sm text-muted-foreground">
              {profile?.city}
              {profile?.state ? `, ${profile.state}` : ""}
            </p>
            <div className="mt-1 flex gap-1">
              {profile?.platforms.map((p) => (
                <Badge key={p} variant="secondary">
                  {p}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {!profile?.isPremium ? (
        <Card className="bg-brand-navy text-white">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-bold">oDriver Premium</p>
              <p className="text-sm text-white/70">Insights de IA, relatórios e mais</p>
            </div>
            <Button render={<Link href="/premium" />} nativeButton={false} variant="secondary">
              Assinar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-warning">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-bold">Você é Premium ⭐</p>
              {profile.premiumUntil && (
                <p className="text-sm text-muted-foreground">
                  Renova em {new Date(profile.premiumUntil).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
            <Button render={<Link href="/premium" />} nativeButton={false} variant="outline">
              Gerenciar
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conquistas</CardTitle>
        </CardHeader>
        <CardContent>
          <BadgeGrid />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configurações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Tema escuro</span>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Mostrar ganhos no ranking público</span>
            <Switch
              checked={profile?.showEarningsPublic ?? false}
              onCheckedChange={(v) => updateProfile({ show_earnings_public: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Notificações de metas</span>
            <Switch
              checked={push.subscribed}
              disabled={!push.supported || push.loading}
              onCheckedChange={(v) => {
                if (v) {
                  push.enable().then((ok) => {
                    if (!ok) toast.error("Não foi possível ativar as notificações");
                  });
                } else {
                  push.disable();
                }
              }}
            />
          </div>
          {!push.supported && (
            <p className="text-xs text-muted-foreground">
              Este navegador não suporta notificações push.
            </p>
          )}
          {push.subscribed && (
            <Button variant="outline" size="sm" className="w-full" onClick={push.sendTest}>
              Enviar notificação de teste
            </Button>
          )}
        </CardContent>
      </Card>

      {profile?.isAdmin && (
        <Button render={<Link href="/admin" />} nativeButton={false} variant="outline" className="w-full">
          Painel Admin
        </Button>
      )}

      <Button variant="outline" className="w-full text-destructive" onClick={logout}>
        Sair da conta
      </Button>
    </div>
  );
}
