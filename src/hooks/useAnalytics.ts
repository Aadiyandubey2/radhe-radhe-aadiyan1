import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AnalyticsData {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  totalTrips: number;
  completedTrips: number;
  pendingPayments: number;
  activeVehicles: number;
  activeDrivers: number;
  vehicleWiseProfits: { vehicle: string; profit: number; trips: number }[];
  monthlyTrends: { month: string; income: number; expenses: number }[];
  expensesByCategory: { category: string; amount: number }[];
  recentTrips: any[];
}

export function useAnalytics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analytics", user?.id],
    queryFn: async (): Promise<AnalyticsData> => {
      const [
        incomeResult,
        expensesResult,
        tripsResult,
        vehiclesResult,
        driversResult,
      ] = await Promise.all([
        supabase.from("income").select("amount, payment_date"),
        supabase.from("expenses").select("amount, category, expense_date, vehicle_id"),
        supabase.from("trips").select("*, vehicles(vehicle_number)"),
        supabase.from("vehicles").select("*").eq("status", "active"),
        supabase.from("drivers").select("*").eq("is_active", true),
      ]);

      const income = incomeResult.data || [];
      const expenses = expensesResult.data || [];
      const trips = tripsResult.data || [];
      const vehicles = vehiclesResult.data || [];
      const drivers = driversResult.data || [];

      const totalIncome = income.reduce((sum, i) => sum + Number(i.amount), 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const netProfit = totalIncome - totalExpenses;

      const completedTrips = trips.filter((t) => t.status === "completed").length;
      const pendingPayments = trips.filter((t) => t.payment_status !== "completed").reduce((sum, t) => sum + (Number(t.fare_amount) - Number(t.advance_amount)), 0);

      // Vehicle-wise profits
      const vehicleWiseProfits = vehicles.map((v) => {
        const vehicleTrips = trips.filter((t) => t.vehicle_id === v.id);
        const vehicleIncome = vehicleTrips.reduce((sum, t) => sum + Number(t.fare_amount), 0);
        const vehicleExpenses = expenses.filter((e) => e.vehicle_id === v.id).reduce((sum, e) => sum + Number(e.amount), 0);
        return {
          vehicle: v.vehicle_number,
          profit: vehicleIncome - vehicleExpenses,
          trips: vehicleTrips.length,
        };
      });

      // Monthly trends (last 6 months)
      const monthlyTrends = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = month.toISOString().slice(0, 7);
        const monthName = month.toLocaleString("default", { month: "short" });
        
        const monthIncome = income
          .filter((inc) => inc.payment_date?.startsWith(monthStr))
          .reduce((sum, inc) => sum + Number(inc.amount), 0);
        
        const monthExpenses = expenses
          .filter((exp) => exp.expense_date?.startsWith(monthStr))
          .reduce((sum, exp) => sum + Number(exp.amount), 0);

        monthlyTrends.push({
          month: monthName,
          income: monthIncome,
          expenses: monthExpenses,
        });
      }

      // Expenses by category
      const categoryMap: Record<string, number> = {};
      expenses.forEach((e) => {
        const category = e.category || "miscellaneous";
        categoryMap[category] = (categoryMap[category] || 0) + Number(e.amount);
      });
      const expensesByCategory = Object.entries(categoryMap).map(([category, amount]) => ({
        category: category.replace("_", " ").toUpperCase(),
        amount,
      }));

      return {
        totalIncome,
        totalExpenses,
        netProfit,
        totalTrips: trips.length,
        completedTrips,
        pendingPayments,
        activeVehicles: vehicles.length,
        activeDrivers: drivers.length,
        vehicleWiseProfits,
        monthlyTrends,
        expensesByCategory,
        recentTrips: trips.slice(0, 5),
      };
    },
    enabled: !!user,
  });
}
