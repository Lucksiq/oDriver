"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { editProfileSchema, type EditProfileFormValues, type EditProfileInput } from "@/lib/schemas";
import { formatPhone } from "@/lib/phone";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import type { Platform } from "@/lib/types";

const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: "uber", label: "Uber" },
  { value: "99", label: "99" },
  { value: "ifood", label: "iFood" },
  { value: "other", label: "Outro" },
];

export function EditProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const supabase = createClient();
  const [platforms, setPlatforms] = useState<Platform[]>(profile?.platforms ?? []);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileFormValues, unknown, EditProfileInput>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      displayName: profile?.displayName ?? "",
      email: user?.email ?? "",
      phone: profile?.phone ? formatPhone(profile.phone) : "",
      city: profile?.city ?? "",
      state: profile?.state ?? "",
      newPassword: "",
    },
  });

  function togglePlatform(p: Platform) {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  async function onSubmit(data: EditProfileInput) {
    if (platforms.length === 0) {
      toast.error("Selecione ao menos uma plataforma");
      return;
    }

    if (data.email !== user?.email) {
      const { error } = await supabase.auth.updateUser({ email: data.email });
      if (error) {
        toast.error(error.message);
        return;
      }
    }

    if (data.newPassword) {
      const { error } = await supabase.auth.updateUser({ password: data.newPassword });
      if (error) {
        toast.error(error.message);
        return;
      }
    }

    const result = await updateProfile({
      display_name: data.displayName,
      phone: data.phone,
      city: data.city,
      state: data.state,
      platforms,
    });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    await refreshProfile();
    toast.success(
      data.email !== user?.email
        ? "Perfil atualizado! Confirme o novo e-mail se seu projeto exigir isso."
        : "Perfil atualizado!",
    );
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-displayName">Nome</Label>
            <Input id="edit-displayName" {...register("displayName")} />
            {errors.displayName && (
              <p className="text-sm text-destructive">{errors.displayName.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-email">E-mail</Label>
            <Input id="edit-email" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-phone">Telefone (com DDD)</Label>
            <Input id="edit-phone" placeholder="(11) 91234-5678" {...register("phone")} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-city">Cidade</Label>
              <Input id="edit-city" {...register("city")} />
              {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-state">Estado</Label>
              <Input id="edit-state" {...register("state")} />
              {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-newPassword">Nova senha (opcional)</Label>
            <Input id="edit-newPassword" type="password" placeholder="Deixe em branco para manter a atual" {...register("newPassword")} />
            {errors.newPassword && (
              <p className="text-sm text-destructive">{errors.newPassword.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Plataformas</Label>
            {PLATFORM_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-3 rounded-md border p-2 cursor-pointer"
              >
                <Checkbox
                  checked={platforms.includes(opt.value)}
                  onCheckedChange={() => togglePlatform(opt.value)}
                />
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
