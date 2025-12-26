import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Simple hash function for PIN storage
export const hashPin = (pin: string) => {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

export interface PinUser {
  id: string;
  owner_id: string;
  name: string;
  pin_hash: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function usePinUsers() {
  const { user, isPinAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: pinUsers = [], isLoading } = useQuery({
    queryKey: ["pin-users", user?.id],
    queryFn: async () => {
      if (!user || isPinAuthenticated) return [];
      
      const { data, error } = await supabase
        .from("pin_users")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as PinUser[];
    },
    enabled: !!user && !isPinAuthenticated,
  });

  const createPinUser = useMutation({
    mutationFn: async ({ name, pin }: { name: string; pin: string }) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("pin_users")
        .insert({
          owner_id: user.id,
          name,
          pin_hash: hashPin(pin),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pin-users"] });
      toast.success("PIN user created / पिन उपयोगकर्ता बनाया गया");
    },
    onError: () => {
      toast.error("Failed to create PIN user / पिन उपयोगकर्ता बनाने में विफल");
    },
  });

  const updatePinUser = useMutation({
    mutationFn: async ({ id, name, pin }: { id: string; name?: string; pin?: string }) => {
      if (!user) throw new Error("Not authenticated");
      
      const updates: Partial<PinUser> = {};
      if (name) updates.name = name;
      if (pin) updates.pin_hash = hashPin(pin);
      
      const { data, error } = await supabase
        .from("pin_users")
        .update(updates)
        .eq("id", id)
        .eq("owner_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pin-users"] });
      toast.success("PIN user updated / पिन उपयोगकर्ता अपडेट किया गया");
    },
    onError: () => {
      toast.error("Failed to update PIN user / अपडेट करने में विफल");
    },
  });

  const deletePinUser = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("pin_users")
        .delete()
        .eq("id", id)
        .eq("owner_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pin-users"] });
      toast.success("PIN user deleted / पिन उपयोगकर्ता हटाया गया");
    },
    onError: () => {
      toast.error("Failed to delete PIN user / हटाने में विफल");
    },
  });

  const togglePinUser = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("pin_users")
        .update({ is_active })
        .eq("id", id)
        .eq("owner_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { is_active }) => {
      queryClient.invalidateQueries({ queryKey: ["pin-users"] });
      toast.success(is_active ? "User activated / उपयोगकर्ता सक्रिय" : "User deactivated / उपयोगकर्ता निष्क्रिय");
    },
  });

  return {
    pinUsers,
    isLoading,
    createPinUser,
    updatePinUser,
    deletePinUser,
    togglePinUser,
  };
}

// Function to verify PIN against all active users - used for public login
export async function verifyPinLogin(pin: string): Promise<{ valid: boolean; ownerId?: string; userName?: string }> {
  const pinHash = hashPin(pin);
  
  const { data, error } = await supabase
    .from("pin_users")
    .select("owner_id, name")
    .eq("pin_hash", pinHash)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    return { valid: false };
  }

  return { valid: true, ownerId: data.owner_id, userName: data.name };
}
