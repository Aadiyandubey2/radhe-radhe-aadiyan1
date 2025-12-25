import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AppRole = "company_admin" | "manager" | "driver" | "accountant" | "super_admin";

export function useUserRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);

      if (error) throw error;
      return data.map((r) => r.role as AppRole);
    },
    enabled: !!user,
  });
}

export function useIsSuperAdmin() {
  const { data: roles } = useUserRole();
  return roles?.includes("super_admin") || roles?.includes("company_admin");
}
