import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Category {
  id: string;
  user_id: string;
  type: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CategoryType = 
  | "vehicle_type" 
  | "expense_category" 
  | "goods_type" 
  | "fuel_type" 
  | "payment_method";

export function useCategories(type?: CategoryType) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["categories", user?.id, type],
    queryFn: async () => {
      let query = supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (type) {
        query = query.eq("type", type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Category[];
    },
    enabled: !!user,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (category: { type: CategoryType; name: string; description?: string }) => {
      const { data, error } = await supabase
        .from("categories")
        .insert([{ ...category, user_id: user!.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...category }: Partial<Category> & { id: string }) => {
      const { data, error } = await supabase
        .from("categories")
        .update(category)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Default categories to seed for new users
export const defaultCategories: { type: CategoryType; name: string; description?: string }[] = [
  { type: "vehicle_type", name: "Truck", description: "Heavy goods vehicle" },
  { type: "vehicle_type", name: "Mini Truck", description: "Light commercial vehicle" },
  { type: "vehicle_type", name: "Trailer", description: "Large trailer truck" },
  { type: "vehicle_type", name: "Container", description: "Container carrier" },
  { type: "expense_category", name: "Fuel", description: "Diesel/Petrol expenses" },
  { type: "expense_category", name: "Driver Salary", description: "Driver wages" },
  { type: "expense_category", name: "Toll & Parking", description: "Highway tolls and parking" },
  { type: "expense_category", name: "Maintenance", description: "Vehicle repairs" },
  { type: "expense_category", name: "Insurance", description: "Vehicle insurance" },
  { type: "expense_category", name: "Permits", description: "Road permits and taxes" },
  { type: "expense_category", name: "Miscellaneous", description: "Other expenses" },
  { type: "goods_type", name: "General Cargo", description: "Mixed goods" },
  { type: "goods_type", name: "Construction Material", description: "Sand, cement, bricks" },
  { type: "goods_type", name: "Agricultural", description: "Farm produce" },
  { type: "goods_type", name: "Industrial", description: "Factory goods" },
  { type: "fuel_type", name: "Diesel" },
  { type: "fuel_type", name: "Petrol" },
  { type: "fuel_type", name: "CNG" },
  { type: "fuel_type", name: "Electric" },
  { type: "payment_method", name: "Cash" },
  { type: "payment_method", name: "Bank Transfer" },
  { type: "payment_method", name: "UPI" },
  { type: "payment_method", name: "Cheque" },
];
