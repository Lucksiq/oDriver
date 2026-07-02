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
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const loginDemo = useAuthStore((s) => s.loginDemo);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  function onSubmit(data: LoginInput) {
    const result = login(data);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    router.push("/dashboard");
  }

  function onDemo() {
    loginDemo();
    toast.success("Entrou com a conta demonstração");
    router.push("/dashboard");
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
        <Button
          variant="outline"
          className="w-full"
          size="lg"
          onClick={() =>
            toast.info("Integração com Google OAuth será configurada com o Supabase Auth")
          }
        >
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
