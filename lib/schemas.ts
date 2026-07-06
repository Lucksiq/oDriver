import { z } from "zod";
import { digitsOnly } from "@/lib/phone";

const numberFromInput = (label: string) =>
  z
    .string()
    .min(1, `${label} é obrigatório`)
    .transform((v) => Number(v.replace(",", ".")))
    .refine((v) => !Number.isNaN(v) && v >= 0, `${label} inválido`);

export const phoneSchema = z
  .string()
  .min(1, "Telefone é obrigatório")
  .transform(digitsOnly)
  .refine((v) => v.length === 10 || v.length === 11, "Informe um telefone válido com DDD");

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    displayName: z.string().min(2, "Informe seu nome"),
    email: z.string().email("E-mail inválido"),
    phone: phoneSchema,
    password: z.string().min(6, "Mínimo de 6 caracteres"),
    confirmPassword: z.string().min(6, "Mínimo de 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const onboardingPlatformsSchema = z.object({
  platforms: z.array(z.enum(["uber", "99", "ifood", "other"])).min(1, "Selecione ao menos uma plataforma"),
});

export const onboardingLocationSchema = z.object({
  city: z.string().min(2, "Informe sua cidade"),
  state: z.string().min(2, "Informe seu estado"),
  phone: phoneSchema,
});

export const editProfileSchema = z.object({
  displayName: z.string().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  phone: phoneSchema,
  city: z.string().min(2, "Informe sua cidade"),
  state: z.string().min(2, "Informe seu estado"),
  // platforms is managed as separate component state (checkboxes aren't
  // wired through react-hook-form's register), validated manually in onSubmit.
  newPassword: z.union([z.string().length(0), z.string().min(6, "Mínimo de 6 caracteres")]).optional(),
});
export type EditProfileFormValues = z.input<typeof editProfileSchema>;
export type EditProfileInput = z.output<typeof editProfileSchema>;

export const onboardingGoalSchema = z.object({
  dailyGoal: numberFromInput("Meta diária"),
});

export const rideQuickSchema = z.object({
  platform: z.enum(["uber", "99", "ifood", "other"]),
  amount: numberFromInput("Valor"),
  distanceKm: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v.replace(",", ".")) : undefined)),
  notes: z.string().max(200).optional(),
});

export const rideDetailedSchema = rideQuickSchema.extend({
  rideType: z.enum(["passenger", "delivery", "pet"]).default("passenger"),
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
  rating: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined)),
});
export type RideDetailedFormValues = z.input<typeof rideDetailedSchema>;
export type RideDetailedInput = z.output<typeof rideDetailedSchema>;

export const batchRideSchema = z.object({
  platform: z.enum(["uber", "99", "ifood", "other"]),
  date: z.string().min(1, "Informe a data"),
  rideCount: z
    .string()
    .min(1, "Informe a quantidade de corridas")
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v >= 1, "Quantidade inválida"),
  totalAmount: numberFromInput("Faturamento total"),
  totalCosts: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v.replace(",", ".")) : undefined)),
});
export type BatchRideFormValues = z.input<typeof batchRideSchema>;
export type BatchRideInput = z.output<typeof batchRideSchema>;

export const expenseSchema = z.object({
  category: z.enum(["fuel", "maintenance", "tax", "food", "platform_fee", "other"]),
  subcategory: z.string().optional(),
  amount: numberFromInput("Valor"),
  liters: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v.replace(",", ".")) : undefined)),
  pricePerLiter: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v.replace(",", ".")) : undefined)),
  description: z.string().max(200).optional(),
});
export type ExpenseFormValues = z.input<typeof expenseSchema>;
export type ExpenseInput = z.output<typeof expenseSchema>;

export const extraEarningSchema = z.object({
  category: z.enum(["bonus", "tip", "other"]),
  amount: numberFromInput("Valor"),
  description: z.string().max(200).optional(),
});
export type ExtraEarningFormValues = z.input<typeof extraEarningSchema>;
export type ExtraEarningInput = z.output<typeof extraEarningSchema>;

export const goalSchema = z.object({
  type: z.enum(["daily", "weekly", "monthly"]),
  amount: numberFromInput("Valor da meta"),
});
export type GoalInput = z.infer<typeof goalSchema>;

export const postSchema = z.object({
  content: z.string().min(1, "Escreva algo").max(280, "Máximo de 280 caracteres"),
  type: z.enum(["tip", "alert", "achievement", "question", "general"]),
});
export type PostInput = z.infer<typeof postSchema>;

export const mapReportSchema = z.object({
  type: z.enum(["accident", "block", "radar", "risk_zone", "hotspot"]),
  description: z.string().max(200).optional(),
});
export type MapReportInput = z.infer<typeof mapReportSchema>;
