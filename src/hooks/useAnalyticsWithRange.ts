import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TimeRange } from "@/components/TimeRangeSelector";
import { format, subDays, subHours, subWeeks, subMonths, startOfHour, startOfDay, startOfWeek, startOfMonth } from "date-fns";

export interface TrendData {
  label: string;
  income: number;
  expenses: number;
}

export function useAnalyticsWithRange(timeRange: TimeRange) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analytics-range", user?.id, timeRange],
    queryFn: async (): Promise<TrendData[]> => {
      const now = new Date();
      let periods: { start: Date; end: Date; label: string }[] = [];

      switch (timeRange) {
        case "hourly":
          // Last 24 hours
          for (let i = 23; i >= 0; i--) {
            const start = startOfHour(subHours(now, i));
            const end = startOfHour(subHours(now, i - 1));
            periods.push({
              start,
              end,
              label: format(start, "HH:mm"),
            });
          }
          break;

        case "daily":
          // Last 7 days
          for (let i = 6; i >= 0; i--) {
            const start = startOfDay(subDays(now, i));
            const end = startOfDay(subDays(now, i - 1));
            periods.push({
              start,
              end,
              label: format(start, "EEE"),
            });
          }
          break;

        case "weekly":
          // Last 8 weeks
          for (let i = 7; i >= 0; i--) {
            const start = startOfWeek(subWeeks(now, i));
            const end = startOfWeek(subWeeks(now, i - 1));
            periods.push({
              start,
              end,
              label: `W${format(start, "w")}`,
            });
          }
          break;

        case "monthly":
        default:
          // Last 6 months
          for (let i = 5; i >= 0; i--) {
            const start = startOfMonth(subMonths(now, i));
            const end = startOfMonth(subMonths(now, i - 1));
            periods.push({
              start,
              end,
              label: format(start, "MMM"),
            });
          }
          break;
      }

      const [incomeResult, expensesResult] = await Promise.all([
        supabase.from("income").select("amount, payment_date"),
        supabase.from("expenses").select("amount, expense_date"),
      ]);

      const income = incomeResult.data || [];
      const expenses = expensesResult.data || [];

      return periods.map(({ start, end, label }) => {
        const periodIncome = income
          .filter((i) => {
            if (!i.payment_date) return false;
            const date = new Date(i.payment_date);
            return date >= start && date < end;
          })
          .reduce((sum, i) => sum + Number(i.amount), 0);

        const periodExpenses = expenses
          .filter((e) => {
            if (!e.expense_date) return false;
            const date = new Date(e.expense_date);
            return date >= start && date < end;
          })
          .reduce((sum, e) => sum + Number(e.amount), 0);

        return {
          label,
          income: periodIncome,
          expenses: periodExpenses,
        };
      });
    },
    enabled: !!user,
  });
}
