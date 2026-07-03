"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loginSchema, type LoginInput } from "@/lib/schemas";
import { createClient } from "@/lib/supabase/client";
import { DEMO_EMAIL, DEMO_PASSWORD, seedDemoAccount } from "@/lib/demo-account";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    const { error } = await supabase.auth.signInWithPassword(data);
    if (error) {
      toast.error(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos"
          : error.message,
      );
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function onGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) toast.error(error.message);
  }

  async function onDemo() {
    let { error } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });

    if (error?.message === "Invalid login credentials") {
      const signUpResult = await supabase.auth.signUp({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        options: { data: { display_name: "Carlos Mendes" } },
      });
      error = signUpResult.error;
      if (!error && signUpResult.data.session) {
        await seedDemoAccount(supabase, signUpResult.data.session.user.id);
      } else if (!error) {
        toast.error(
          "Conta demonstração criada, mas precisa de confirmação de e-mail neste projeto. Fale com quem configurou o Supabase.",
        );
        return;
      }
    }

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Entrou com a conta demonstração");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="voce@email.com" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" placeholder="••••••" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            Entrar
          </Button>
        </form>
        <Button variant="outline" className="w-full" size="lg" onClick={onGoogle}>
          Continuar com Google
        </Button>
        <Button variant="ghost" className="w-full" onClick={onDemo}>
          Entrar com conta demonstração
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link href="/register" className="text-primary font-medium">
            Cadastre-se
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
