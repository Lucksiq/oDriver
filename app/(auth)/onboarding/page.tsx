"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/client";
import { digitsOnly, formatPhone } from "@/lib/phone";
import type { Platform } from "@/lib/types";

const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: "uber", label: "Uber" },
  { value: "99", label: "99" },
  { value: "ifood", label: "iFood" },
  { value: "other", label: "Outro" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [phone, setPhone] = useState("");
  const [dailyGoal, setDailyGoal] = useState("150");

  useEffect(() => {
    // Prefills the phone collected at signup (email/password path) so the
    // user isn't asked twice; stays empty for Google OAuth signups, which
    // never went through the register form and must fill it in here.
    async function loadPhone() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("phone").eq("id", user.id).single();
      if (data?.phone) setPhone(formatPhone(data.phone));
    }
    loadPhone();
  }, [supabase]);

  function togglePlatform(p: Platform) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  async function next() {
    if (step === 1 && platforms.length === 0) {
      toast.error("Selecione ao menos uma plataforma");
      return;
    }
    if (step === 2 && (!city || !state)) {
      toast.error("Informe cidade e estado");
      return;
    }
    if (step === 2 && digitsOnly(phone).length !== 10 && digitsOnly(phone).length !== 11) {
      toast.error("Informe um telefone válido com DDD");
      return;
    }
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    const goal = Number(dailyGoal.replace(",", "."));
    if (Number.isNaN(goal) || goal <= 0) {
      toast.error("Informe uma meta diária válida");
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Sessão expirada, faça login novamente");
      router.push("/login");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({
        platforms,
        city,
        state,
        phone: digitsOnly(phone),
        daily_goal: goal,
        onboarding_complete: true,
      })
      .eq("id", user.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Tudo pronto! Bem-vindo ao oDriver.");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vamos configurar seu perfil</CardTitle>
        <Progress value={(step / 3) * 100} className="mt-3" />
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Quais plataformas você usa?
            </p>
            {PLATFORM_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-3 rounded-md border p-3 cursor-pointer"
              >
                <Checkbox
                  checked={platforms.includes(opt.value)}
                  onCheckedChange={() => togglePlatform(opt.value)}
                />
                <span className="font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Onde você dirige?</p>
            <div className="space-y-1.5">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="São Paulo"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="SP"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone (com DDD)</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 91234-5678"
              />
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Qual sua meta diária de ganhos?
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="dailyGoal">Meta diária (R$)</Label>
              <Input
                id="dailyGoal"
                inputMode="decimal"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(e.target.value)}
                placeholder="150"
              />
            </div>
          </div>
        )}
        <div className="flex gap-2">
          {step > 1 && (
            <Button variant="outline" className="flex-1" onClick={() => setStep(step - 1)}>
              Voltar
            </Button>
          )}
          <Button className="flex-1" size="lg" onClick={next}>
            {step < 3 ? "Continuar" : "Concluir"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
