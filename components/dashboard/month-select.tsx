"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getMonth, getSelectableMonths } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function MonthSelect({
  monthId,
  onMonth,
  disabled = false,
}: {
  monthId: string;
  onMonth: (monthId: string) => void;
  disabled?: boolean;
}) {
  const month = getMonth(monthId);
  const months = getSelectableMonths();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium disabled:opacity-50"
        >
          {month.label}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="max-h-80 w-64 overflow-y-auto p-1">
        <ul>
          {months.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  onMonth(item.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted",
                  item.id === monthId && "bg-primary/10 font-medium text-primary",
                )}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
