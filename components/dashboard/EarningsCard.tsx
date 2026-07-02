import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import { cn } from "@/lib/utils";

export function EarningsCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "success" | "warning";
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p
          className={cn(
            "mt-1 text-2xl font-bold tabular-nums",
            tone === "success" && "text-success",
            tone === "warning" && "text-warning",
          )}
        >
          {formatCurrency(value)}
        </p>
      </CardContent>
    </Card>
  );
}
