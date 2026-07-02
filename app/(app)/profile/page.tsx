"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { BadgeGrid } from "@/components/community/BadgeGrid";
import { useAuthStore, useCurrentProfile } from "@/stores/authStore";

export default function ProfilePage() {
  const router = useRouter();
  const profile = useCurrentProfile();
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const logout = useAuthStore((s) => s.logout);
  const { theme, setTheme } = useTheme();

  const initials = (profile?.displayName ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  function handleLogout() {
    logout();
    router.push("/login");
  }

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
              onCheckedChange={(v) => updateProfile({ showEarningsPublic: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Notificações de metas</span>
            <Switch defaultChecked onCheckedChange={() => toast.info("Preferência salva")} />
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full text-destructive" onClick={handleLogout}>
        Sair da conta
      </Button>
    </div>
  );
}
