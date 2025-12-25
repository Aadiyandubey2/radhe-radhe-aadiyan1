import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SearchResult {
  type: "trip" | "vehicle" | "driver" | "client" | "expense" | "income";
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: string;
}

export function useGlobalSearch(query: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["global-search", query, user?.id],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!query || query.length < 2) return [];

      const searchTerm = `%${query}%`;
      const results: SearchResult[] = [];

      // Search trips
      const { data: trips } = await supabase
        .from("trips")
        .select("id, trip_number, pickup_location, drop_location, status")
        .or(`trip_number.ilike.${searchTerm},pickup_location.ilike.${searchTerm},drop_location.ilike.${searchTerm}`)
        .limit(5);

      trips?.forEach((t) => {
        results.push({
          type: "trip",
          id: t.id,
          title: t.trip_number,
          subtitle: `${t.pickup_location} → ${t.drop_location}`,
          href: "/trips",
          icon: "Route",
        });
      });

      // Search vehicles
      const { data: vehicles } = await supabase
        .from("vehicles")
        .select("id, vehicle_number, vehicle_type, make, model")
        .or(`vehicle_number.ilike.${searchTerm},vehicle_type.ilike.${searchTerm},make.ilike.${searchTerm},model.ilike.${searchTerm}`)
        .limit(5);

      vehicles?.forEach((v) => {
        results.push({
          type: "vehicle",
          id: v.id,
          title: v.vehicle_number,
          subtitle: `${v.make || ""} ${v.model || ""} - ${v.vehicle_type}`.trim(),
          href: "/vehicles",
          icon: "Truck",
        });
      });

      // Search drivers
      const { data: drivers } = await supabase
        .from("drivers")
        .select("id, name, phone, license_number")
        .or(`name.ilike.${searchTerm},phone.ilike.${searchTerm},license_number.ilike.${searchTerm}`)
        .limit(5);

      drivers?.forEach((d) => {
        results.push({
          type: "driver",
          id: d.id,
          title: d.name,
          subtitle: d.phone || d.license_number || "",
          href: "/drivers",
          icon: "Users",
        });
      });

      // Search clients
      const { data: clients } = await supabase
        .from("clients")
        .select("id, name, company_name, phone")
        .or(`name.ilike.${searchTerm},company_name.ilike.${searchTerm},phone.ilike.${searchTerm}`)
        .limit(5);

      clients?.forEach((c) => {
        results.push({
          type: "client",
          id: c.id,
          title: c.name,
          subtitle: c.company_name || c.phone || "",
          href: "/clients",
          icon: "Building2",
        });
      });

      return results;
    },
    enabled: !!user && query.length >= 2,
    staleTime: 1000,
  });
}

export function useAIAssistant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ action, message, context }: { action?: string; message: string; context?: any }) => {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: { action, message, context },
      });

      if (error) throw error;
      return data;
    },
    onError: (error: any) => {
      console.error("AI Assistant error:", error);
    },
  });
}
