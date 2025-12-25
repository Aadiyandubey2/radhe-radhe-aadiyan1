import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Expense {
  id: string;
  user_id: string;
  trip_id: string | null;
  vehicle_id: string | null;
  driver_id: string | null;
  category: "fuel" | "driver_salary" | "toll_parking" | "maintenance" | "insurance" | "permits" | "miscellaneous";
  amount: number;
  description: string | null;
  expense_date: string;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
  vehicles?: { vehicle_number: string } | null;
  drivers?: { name: string } | null;
  trips?: { trip_number: string } | null;
}

export function useExpenses(tripId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["expenses", user?.id, tripId],
    queryFn: async () => {
      let query = supabase
        .from("expenses")
        .select("*, vehicles(vehicle_number), drivers(name), trips(trip_number)")
        .order("expense_date", { ascending: false });

      if (tripId) {
        query = query.eq("trip_id", tripId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!user,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (expense: Omit<Expense, "id" | "user_id" | "created_at" | "updated_at" | "vehicles" | "drivers" | "trips">) => {
      const { data, error } = await supabase
        .from("expenses")
        .insert([{ ...expense, user_id: user!.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Expense added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...expense }: Partial<Expense> & { id: string }) => {
      const { data, error } = await supabase
        .from("expenses")
        .update(expense)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Expense updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Expense deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
