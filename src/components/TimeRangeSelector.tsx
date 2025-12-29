import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TimeRange = "hourly" | "daily" | "weekly" | "monthly";

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

const options: { value: TimeRange; label: string }[] = [
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex gap-1 bg-muted p-1 rounded-lg">
      {options.map((option) => (
        <Button
          key={option.value}
          variant="ghost"
          size="sm"
          onClick={() => onChange(option.value)}
          className={cn(
            "h-7 px-2 sm:px-3 text-xs sm:text-sm rounded-md transition-all",
            value === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
