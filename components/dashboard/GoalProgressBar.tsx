import { isToday } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatTime } from "@/lib/calculations";

function formatProjection(date: Date) {
  if (isToday(date)) return `às ${formatTime(date)}`;
  return `em ${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} às ${formatTime(date)}`;
}

export function GoalProgressBar({
  label,
  current,
  goal,
  projection,
}: {
  label: string;
  current: number;
  goal: number;
  projection?: Date | null;
}) {
  const pct = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;
  const achieved = current >= goal && goal > 0;

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-muted-foreground tabular-nums">
            {formatCurrency(current)} / {formatCurrency(goal)}
          </p>
        </div>
        <Progress value={pct} className={achieved ? "[&>div]:bg-success" : undefined} />
        {achieved ? (
          <p className="text-xs font-medium text-success">Meta atingida! 🎯</p>
        ) : projection ? (
          <p className="text-xs text-muted-foreground">
            No ritmo atual, você vai atingir a meta {formatProjection(projection)}
          </p>
        ) : current > 0 ? (
          <p className="text-xs text-muted-foreground">
            No ritmo atual, a meta não será atingida neste período
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Registre corridas para ver a projeção
          </p>
        )}
      </CardContent>
    </Card>
  );
}
