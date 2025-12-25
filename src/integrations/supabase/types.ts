export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          related_type: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          related_type?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          billing_address: string | null
          company_name: string | null
          created_at: string | null
          email: string | null
          gst_number: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          billing_address?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          gst_number?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          billing_address?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          gst_number?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      drivers: {
        Row: {
          aadhaar_number: string | null
          address: string | null
          assigned_vehicle_id: string | null
          created_at: string | null
          email: string | null
          emergency_contact: string | null
          id: string
          is_active: boolean | null
          license_expiry: string | null
          license_number: string | null
          name: string
          phone: string
          salary_amount: number | null
          salary_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          aadhaar_number?: string | null
          address?: string | null
          assigned_vehicle_id?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact?: string | null
          id?: string
          is_active?: boolean | null
          license_expiry?: string | null
          license_number?: string | null
          name: string
          phone: string
          salary_amount?: number | null
          salary_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          aadhaar_number?: string | null
          address?: string | null
          assigned_vehicle_id?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact?: string | null
          id?: string
          is_active?: boolean | null
          license_expiry?: string | null
          license_number?: string | null
          name?: string
          phone?: string
          salary_amount?: number | null
          salary_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drivers_assigned_vehicle_id_fkey"
            columns: ["assigned_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string | null
          description: string | null
          driver_id: string | null
          expense_date: string | null
          id: string
          receipt_url: string | null
          trip_id: string | null
          updated_at: string | null
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at?: string | null
          description?: string | null
          driver_id?: string | null
          expense_date?: string | null
          id?: string
          receipt_url?: string | null
          trip_id?: string | null
          updated_at?: string | null
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string | null
          description?: string | null
          driver_id?: string | null
          expense_date?: string | null
          id?: string
          receipt_url?: string | null
          trip_id?: string | null
          updated_at?: string | null
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      income: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          reference_number: string | null
          trip_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          reference_number?: string | null
          trip_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          reference_number?: string | null
          trip_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          company_name: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          gst_number: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          gst_number?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          gst_number?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      trips: {
        Row: {
          advance_amount: number | null
          client_id: string | null
          created_at: string | null
          distance_km: number | null
          driver_id: string | null
          drop_lat: number | null
          drop_lng: number | null
          drop_location: string
          end_date: string | null
          fare_amount: number | null
          goods_type: string | null
          id: string
          notes: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          pickup_lat: number | null
          pickup_lng: number | null
          pickup_location: string
          start_date: string | null
          status: Database["public"]["Enums"]["trip_status"] | null
          trip_number: string
          updated_at: string | null
          user_id: string
          vehicle_id: string | null
          weight: string | null
        }
        Insert: {
          advance_amount?: number | null
          client_id?: string | null
          created_at?: string | null
          distance_km?: number | null
          driver_id?: string | null
          drop_lat?: number | null
          drop_lng?: number | null
          drop_location: string
          end_date?: string | null
          fare_amount?: number | null
          goods_type?: string | null
          id?: string
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          pickup_location: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["trip_status"] | null
          trip_number: string
          updated_at?: string | null
          user_id: string
          vehicle_id?: string | null
          weight?: string | null
        }
        Update: {
          advance_amount?: number | null
          client_id?: string | null
          created_at?: string | null
          distance_km?: number | null
          driver_id?: string | null
          drop_lat?: number | null
          drop_lng?: number | null
          drop_location?: string
          end_date?: string | null
          fare_amount?: number | null
          goods_type?: string | null
          id?: string
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          pickup_location?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["trip_status"] | null
          trip_number?: string
          updated_at?: string | null
          user_id?: string
          vehicle_id?: string | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trips_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trips_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          capacity: string | null
          created_at: string | null
          fitness_expiry: string | null
          fuel_type: string | null
          id: string
          insurance_expiry: string | null
          make: string | null
          model: string | null
          permit_expiry: string | null
          registration_expiry: string | null
          status: Database["public"]["Enums"]["vehicle_status"] | null
          updated_at: string | null
          user_id: string
          vehicle_number: string
          vehicle_type: string
          year: number | null
        }
        Insert: {
          capacity?: string | null
          created_at?: string | null
          fitness_expiry?: string | null
          fuel_type?: string | null
          id?: string
          insurance_expiry?: string | null
          make?: string | null
          model?: string | null
          permit_expiry?: string | null
          registration_expiry?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          updated_at?: string | null
          user_id: string
          vehicle_number: string
          vehicle_type: string
          year?: number | null
        }
        Update: {
          capacity?: string | null
          created_at?: string | null
          fitness_expiry?: string | null
          fuel_type?: string | null
          id?: string
          insurance_expiry?: string | null
          make?: string | null
          model?: string | null
          permit_expiry?: string | null
          registration_expiry?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          updated_at?: string | null
          user_id?: string
          vehicle_number?: string
          vehicle_type?: string
          year?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "company_admin"
        | "manager"
        | "driver"
        | "accountant"
        | "super_admin"
      expense_category:
        | "fuel"
        | "driver_salary"
        | "toll_parking"
        | "maintenance"
        | "insurance"
        | "permits"
        | "miscellaneous"
      payment_status: "pending" | "partial" | "completed"
      trip_status:
        | "created"
        | "assigned"
        | "running"
        | "completed"
        | "cancelled"
      vehicle_status: "active" | "maintenance" | "inactive"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "company_admin",
        "manager",
        "driver",
        "accountant",
        "super_admin",
      ],
      expense_category: [
        "fuel",
        "driver_salary",
        "toll_parking",
        "maintenance",
        "insurance",
        "permits",
        "miscellaneous",
      ],
      payment_status: ["pending", "partial", "completed"],
      trip_status: ["created", "assigned", "running", "completed", "cancelled"],
      vehicle_status: ["active", "maintenance", "inactive"],
    },
  },
} as const
