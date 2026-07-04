import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/calculations";
import type { RankingEntry } from "@/lib/types";

export function RankingCard({
  entry,
  position,
  format = formatCurrency,
}: {
  entry: RankingEntry;
  position: number;
  format?: (value: number) => string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border p-3",
        entry.isCurrentUser && "border-primary bg-accent",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-full text-sm font-bold",
            position <= 3 ? "bg-warning text-warning-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {position}
        </span>
        <div>
          <p className="text-sm font-medium">
            {entry.displayName}
            {entry.isCurrentUser && " (você)"}
          </p>
          <p className="text-xs text-muted-foreground">{entry.city}</p>
        </div>
      </div>
      <span className="font-bold tabular-nums">{format(entry.value)}</span>
    </div>
  );
}
