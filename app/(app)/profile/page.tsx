"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { BadgeGrid } from "@/components/community/BadgeGrid";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { useAuth } from "@/providers/AuthProvider";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { createClient } from "@/lib/supabase/client";
import { collectUserData, downloadJson } from "@/lib/data-export";

export default function ProfilePage() {
  const { user, profile, updateProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const push = usePushNotifications();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const supabase = createClient();

  async function handleExportData() {
    if (!user) return;
    setExporting(true);
    try {
      const data = await collectUserData(supabase, user.id);
      downloadJson(data, `odriver-meus-dados-${new Date().toISOString().slice(0, 10)}.json`);
    } finally {
      setExporting(false);
    }
  }

  async function handleDeleteAccount() {
    setDeletingAccount(true);
    const { error } = await supabase.rpc("delete_own_account");
    if (error) {
      toast.error(error.message);
      setDeletingAccount(false);
      return;
    }
    toast.success("Conta excluída. Sentiremos sua falta!");
    await logout();
  }

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

      <Button variant="outline" className="w-full" onClick={() => setEditOpen(true)}>
        Editar perfil
      </Button>
      <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} />

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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Privacidade e dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Leia nossa{" "}
            <Link href="/privacy" className="underline">
              Política de Privacidade
            </Link>{" "}
            e os{" "}
            <Link href="/terms" className="underline">
              Termos de Uso
            </Link>
            .
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleExportData}
            disabled={exporting}
          >
            Baixar meus dados
          </Button>
          <Button
            variant="outline"
            className="w-full text-destructive"
            onClick={() => setDeleteAccountOpen(true)}
          >
            Excluir minha conta
          </Button>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full text-destructive" onClick={logout}>
        Sair da conta
      </Button>

      <AlertDialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir sua conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso apaga permanentemente seu perfil, corridas, despesas, metas, reports no mapa,
              grupos de ranking, canais de voz e qualquer outro dado associado à sua conta. Essa
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletingAccount}
              onClick={handleDeleteAccount}
            >
              Excluir permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
