import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Trip {
  id: string;
  user_id: string;
  trip_number: string;
  vehicle_id: string | null;
  driver_id: string | null;
  client_id: string | null;
  pickup_location: string;
  drop_location: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  drop_lat: number | null;
  drop_lng: number | null;
  goods_type: string | null;
  weight: string | null;
  distance_km: number | null;
  start_date: string | null;
  end_date: string | null;
  status: "created" | "assigned" | "running" | "completed" | "cancelled";
  fare_amount: number;
  advance_amount: number;
  payment_status: "pending" | "partial" | "completed";
  notes: string | null;
  created_at: string;
  updated_at: string;
  vehicles?: { vehicle_number: string } | null;
  drivers?: { name: string } | null;
  clients?: { name: string; company_name: string | null } | null;
}

export function useTrips() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["trips", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("*, vehicles(vehicle_number), drivers(name), clients(name, company_name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Trip[];
    },
    enabled: !!user,
  });
}

export function useTripWithFinancials(tripId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["trip-financials", tripId, user?.id],
    queryFn: async () => {
      // Fetch trip
      const { data: trip, error: tripError } = await supabase
        .from("trips")
        .select("*, vehicles(vehicle_number), drivers(name), clients(name, company_name)")
        .eq("id", tripId)
        .single();

      if (tripError) throw tripError;

      // Fetch expenses for this trip
      const { data: expenses, error: expensesError } = await supabase
        .from("expenses")
        .select("*")
        .eq("trip_id", tripId);

      if (expensesError) throw expensesError;

      // Fetch income for this trip
      const { data: income, error: incomeError } = await supabase
        .from("income")
        .select("*")
        .eq("trip_id", tripId);

      if (incomeError) throw incomeError;

      const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const totalIncome = income?.reduce((sum, i) => sum + Number(i.amount), 0) || 0;
      const profit = totalIncome - totalExpenses;

      return {
        ...trip,
        expenses,
        income,
        totalExpenses,
        totalIncome,
        profit,
      };
    },
    enabled: !!user && !!tripId,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (trip: Omit<Trip, "id" | "user_id" | "trip_number" | "created_at" | "updated_at" | "vehicles" | "drivers" | "clients">) => {
      const { data, error } = await supabase
        .from("trips")
        .insert([{ ...trip, user_id: user!.id, trip_number: "" }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Trip created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...trip }: Partial<Trip> & { id: string }) => {
      const { data, error } = await supabase
        .from("trips")
        .update(trip)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Trip updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("trips").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Trip deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
