"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface GrowthPoint {
  label: string;
  novos: number;
}

export function UserGrowthChart({ data }: { data: GrowthPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Novos usuários (14 dias)</CardTitle>
      </CardHeader>
      <CardContent className="h-56 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
            <Tooltip cursor={{ fill: "var(--muted)" }} />
            <Bar dataKey="novos" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
