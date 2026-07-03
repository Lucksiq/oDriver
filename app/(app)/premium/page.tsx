"use client";

import { Check } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";

const FEATURES = [
  "Histórico ilimitado de corridas e despesas",
  "Insights de IA (melhores horários e regiões)",
  "Exportação de relatórios em PDF/Excel",
  "Canais de voz privados para grupos de ranking",
  "Grupos de ranking privados ilimitados",
  "Badge exclusivo oDriver Pro",
  "Suporte prioritário",
];

export default function PremiumPage() {
  const { profile, updateProfile } = useAuth();

  async function subscribe() {
    const result = await updateProfile({
      is_premium: true,
      premium_until: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    });
    if (result.ok) {
      toast.success("Assinatura Premium ativada (simulação — sem cobrança real)");
    } else {
      toast.error(result.error);
    }
  }

  async function cancel() {
    const result = await updateProfile({ is_premium: false, premium_until: null });
    if (result.ok) {
      toast.info("Assinatura cancelada");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader title="oDriver Premium" subtitle="Vá além do básico" />

      <Card className="bg-brand-navy text-white">
        <CardContent className="p-4 text-center">
          <p className="text-3xl font-bold">R$ 19,90/mês</p>
          <p className="text-sm text-white/70">ou R$ 149/ano (economize 2 meses)</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">O que você ganha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {FEATURES.map((f) => (
            <div key={f} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-success" />
              {f}
            </div>
          ))}
        </CardContent>
      </Card>

      {profile?.isPremium ? (
        <Button variant="outline" className="w-full text-destructive" size="lg" onClick={cancel}>
          Cancelar assinatura
        </Button>
      ) : (
        <Button className="w-full" size="lg" onClick={subscribe}>
          Assinar agora
        </Button>
      )}
      <p className="text-center text-xs text-muted-foreground">
        Pagamento via Stripe será integrado antes do lançamento — esta tela é uma simulação.
      </p>
    </div>
  );
}
