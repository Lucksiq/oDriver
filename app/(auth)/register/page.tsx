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
import { registerSchema, type RegisterInput } from "@/lib/schemas";
import { useAuthStore } from "@/stores/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const registerAccount = useAuthStore((s) => s.register);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  function onSubmit(data: RegisterInput) {
    const result = registerAccount(data);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Conta criada! Vamos configurar seu perfil.");
    router.push("/onboarding");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="displayName">Nome</Label>
            <Input id="displayName" placeholder="Seu nome" {...register("displayName")} />
            {errors.displayName && (
              <p className="text-sm text-destructive">{errors.displayName.message}</p>
            )}
          </div>
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
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            Criar conta
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="text-primary font-medium">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
