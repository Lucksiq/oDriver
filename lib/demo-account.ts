import type { SupabaseClient } from "@supabase/supabase-js";
import { subDays } from "date-fns";
import type { Database } from "@/lib/supabase/types";

export const DEMO_EMAIL = "demo@odriver.app";
export const DEMO_PASSWORD = "demo123456";

/** Populates a freshly-created demo account with sample data so the app isn't empty on first look. */
export async function seedDemoAccount(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  await supabase
    .from("profiles")
    .update({
      city: "São Paulo",
      state: "SP",
      platforms: ["uber", "99", "ifood"],
      daily_goal: 200,
      weekly_goal: 1200,
      monthly_goal: 5000,
      onboarding_complete: true,
    })
    .eq("id", userId);

  const rides = [];
  for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
    const day = subDays(new Date(), daysAgo);
    const rideCount = daysAgo === 0 ? 4 : 2;
    for (let i = 0; i < rideCount; i++) {
      const platforms = ["uber", "99", "ifood"] as const;
      rides.push({
        user_id: userId,
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        amount: Number((15 + Math.random() * 30).toFixed(2)),
        distance_km: Number((2 + Math.random() * 12).toFixed(1)),
        duration_minutes: Math.floor(10 + Math.random() * 25),
        ride_type: "passenger",
        created_at: day.toISOString(),
      });
    }
  }
  await supabase.from("rides").insert(rides);

  await supabase.from("expenses").insert([
    {
      user_id: userId,
      category: "fuel",
      subcategory: "gasolina",
      amount: 210,
      liters: 35,
      price_per_liter: 6,
      description: "Abastecimento",
      occurred_at: subDays(new Date(), 2).toISOString(),
    },
    {
      user_id: userId,
      category: "food",
      amount: 22,
      description: "Almoço",
      occurred_at: subDays(new Date(), 1).toISOString(),
    },
  ]);

  await supabase.from("extra_earnings").insert([
    {
      user_id: userId,
      category: "tip",
      amount: 10,
      description: "Gorjeta em dinheiro",
      occurred_at: subDays(new Date(), 1).toISOString(),
    },
  ]);
}
