export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      material: {
        Row: {
          code: string
          created_at: string
          measurement_unit: string | null
          subheading: string | null
          type: Database["public"]["Enums"]["material_type"] | null
        }
        Insert: {
          code: string
          created_at?: string
          measurement_unit?: string | null
          subheading?: string | null
          type?: Database["public"]["Enums"]["material_type"] | null
        }
        Update: {
          code?: string
          created_at?: string
          measurement_unit?: string | null
          subheading?: string | null
          type?: Database["public"]["Enums"]["material_type"] | null
        }
        Relationships: []
      }
      profile: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_role_fkey"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "user_role"
            referencedColumns: ["name"]
          },
        ]
      }
      record: {
        Row: {
          created_at: string
          currency: Database["public"]["Enums"]["currency"]
          description: string | null
          id: number
          item: number
          material_code: string
          measurement_unit: string
          net_price: number | null
          purchase_order: string
          quantity: number
          supplier_id: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          currency: Database["public"]["Enums"]["currency"]
          description?: string | null
          id?: number
          item: number
          material_code: string
          measurement_unit: string
          net_price?: number | null
          purchase_order: string
          quantity?: number
          supplier_id: number
          unit_price: number
        }
        Update: {
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          description?: string | null
          id?: number
          item?: number
          material_code?: string
          measurement_unit?: string
          net_price?: number | null
          purchase_order?: string
          quantity?: number
          supplier_id?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "record_material_code_fkey"
            columns: ["material_code"]
            isOneToOne: false
            referencedRelation: "material"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "record_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier"
            referencedColumns: ["id"]
          },
        ]
      }
      record_info: {
        Row: {
          bill_number: string
          billed_quantity: number
          billed_total_price: number
          billed_unit_price: number
          created_at: string
          created_by: string
          gross_weight: number
          id: number
          modified_at: string
          packages: number
          record_id: number
          status: "PENDING" | "SUCCESS" | "ERROR"
          trm: number
        }
        Insert: {
          bill_number: string
          billed_quantity: number
          billed_total_price: number
          billed_unit_price: number
          created_at?: string
          created_by?: string
          gross_weight: number
          id?: number
          modified_at?: string
          packages: number
          record_id: number
          status?: "PENDING" | "SUCCESS" | "ERROR"
          trm: number
        }
        Update: {
          bill_number?: string
          billed_quantity?: number
          billed_total_price?: number
          billed_unit_price?: number
          created_at?: string
          created_by?: string
          gross_weight?: number
          id?: number
          modified_at?: string
          packages?: number
          record_id?: number
          status?: "PENDING" | "SUCCESS" | "ERROR"
          trm?: number
        }
        Relationships: [
          {
            foreignKeyName: "record_info_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "record_info_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "record"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier: {
        Row: {
          created_at: string
          domain: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      supplier_employee: {
        Row: {
          since: string | null
          supplier_id: number
          user_id: string
        }
        Insert: {
          since?: string | null
          supplier_id: number
          user_id: string
        }
        Update: {
          since?: string | null
          supplier_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_employee_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "supplier"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_employee_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profile"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_material: {
        Args: {
          code: string
          permission: unknown
        }
        Returns: boolean
      }
      can_access_record: {
        Args: {
          id: number
          permission: unknown
        }
        Returns: boolean
      }
      can_access_record_info: {
        Args: {
          id: number
          permission: unknown
        }
        Returns: boolean
      }
      name_domain: {
        Args: {
          supplier: unknown
        }
        Returns: string
      }
      role_has_permission: {
        Args: {
          table_name: string
          user_permission?: unknown
          user_role?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      currency: "COP" | "USD"
      material_type: "national" | "foreign"
      request_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

