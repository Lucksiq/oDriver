"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapExpenseRow, mapExtraEarningRow } from "@/lib/supabase/mappers";
import { useAuth } from "@/providers/AuthProvider";
import type { Expense, ExtraEarning } from "@/lib/types";

export function useFinances() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [extraEarnings, setExtraEarnings] = useState<ExtraEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const refresh = useCallback(async () => {
    if (!user) {
      setExpenses([]);
      setExtraEarnings([]);
      setLoading(false);
      return;
    }
    const [expensesRes, earningsRes] = await Promise.all([
      supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("occurred_at", { ascending: false }),
      supabase
        .from("extra_earnings")
        .select("*")
        .eq("user_id", user.id)
        .order("occurred_at", { ascending: false }),
    ]);
    setExpenses((expensesRes.data ?? []).map(mapExpenseRow));
    setExtraEarnings((earningsRes.data ?? []).map(mapExtraEarningRow));
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    // Fetch-on-mount/user-change; the "no user" branch resolves synchronously,
    // which the linter can't distinguish from an unintended cascading render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  async function addExpense(input: Omit<Expense, "id" | "createdAt">) {
    if (!user) return;
    await supabase.from("expenses").insert({
      user_id: user.id,
      category: input.category,
      subcategory: input.subcategory ?? null,
      amount: input.amount,
      liters: input.liters ?? null,
      price_per_liter: input.pricePerLiter ?? null,
      description: input.description ?? null,
      occurred_at: input.occurredAt,
    });
    await refresh();
  }

  async function removeExpense(id: string) {
    await supabase.from("expenses").delete().eq("id", id);
    await refresh();
  }

  async function addExtraEarning(input: Omit<ExtraEarning, "id">) {
    if (!user) return;
    await supabase.from("extra_earnings").insert({
      user_id: user.id,
      category: input.category,
      amount: input.amount,
      description: input.description ?? null,
      occurred_at: input.occurredAt,
    });
    await refresh();
  }

  async function removeExtraEarning(id: string) {
    await supabase.from("extra_earnings").delete().eq("id", id);
    await refresh();
  }

  return {
    expenses,
    extraEarnings,
    loading,
    addExpense,
    removeExpense,
    addExtraEarning,
    removeExtraEarning,
  };
}
