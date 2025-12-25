import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Income {
  id: string;
  user_id: string;
  trip_id: string | null;
  client_id: string | null;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  trips?: { trip_number: string } | null;
  clients?: { name: string; company_name: string | null } | null;
}

export function useIncome() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["income", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("income")
        .select("*, trips(trip_number), clients(name, company_name)")
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return data as Income[];
    },
    enabled: !!user,
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (income: Omit<Income, "id" | "user_id" | "created_at" | "updated_at" | "trips" | "clients">) => {
      const { data, error } = await supabase
        .from("income")
        .insert([{ ...income, user_id: user!.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Income added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...income }: Partial<Income> & { id: string }) => {
      const { data, error } = await supabase
        .from("income")
        .update(income)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Income updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("income").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Income deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
