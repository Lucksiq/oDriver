"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";

export interface WeeklyChartPoint {
  label: string;
  ganhos: number;
  despesas: number;
}

export function WeeklyChart({ data }: { data: WeeklyChartPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ganhos vs. despesas (7 dias)</CardTitle>
      </CardHeader>
      <CardContent className="h-56 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              cursor={{ fill: "var(--muted)" }}
            />
            <Bar dataKey="ganhos" fill="var(--success)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="despesas" fill="var(--destructive)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
