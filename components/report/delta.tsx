import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { formatDeltaPT, formatPointsPT } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Delta({
  value,
  invert = false,
  points = false,
  className,
  title,
}: {
  value: number | null;
  invert?: boolean;
  points?: boolean;
  className?: string;
  title?: string;
}) {
  if (value === null || Number.isNaN(value)) {
    return <span className={cn("text-sm font-medium text-muted-foreground", className)}>Novo</span>;
  }

  const neutral = Math.abs(value) < 0.05;
  const up = value > 0;
  const good = neutral ? null : invert ? !up : up;
  const color = neutral ? "text-muted-foreground" : good ? "text-up" : "text-down";
  const Icon = neutral ? Minus : up ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-0.5 font-medium tabular-nums",
        color,
        className,
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span>{points ? formatPointsPT(value) : formatDeltaPT(value)}</span>
    </span>
  );
}
