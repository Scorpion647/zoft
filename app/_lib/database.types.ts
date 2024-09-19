export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      appdata: {
        Row: {
          created_at: string;
          key: Database["public"]["Enums"]["app_options"];
          updated_at: string;
          value: Json;
        };
        Insert: {
          created_at?: string;
          key: Database["public"]["Enums"]["app_options"];
          updated_at?: string;
          value: Json;
        };
        Update: {
          created_at?: string;
          key?: Database["public"]["Enums"]["app_options"];
          updated_at?: string;
          value?: Json;
        };
        Relationships: [];
      };
      base_bills: {
        Row: {
          base_bill_id: string;
          created_at: string;
          currency: Database["public"]["Enums"]["currency"];
          description: string | null;
          item: number;
          material_code: string;
          measurement_unit: string;
          net_price: number | null;
          purchase_order: string;
          quantity: number;
          supplier_id: number;
          unit_price: number;
          base_bill_search: string | null;
        };
        Insert: {
          base_bill_id?: string;
          created_at?: string;
          currency: Database["public"]["Enums"]["currency"];
          description?: string | null;
          item: number;
          material_code: string;
          measurement_unit: string;
          net_price?: number | null;
          purchase_order: string;
          quantity?: number;
          supplier_id: number;
          unit_price: number;
        };
        Update: {
          base_bill_id?: string;
          created_at?: string;
          currency?: Database["public"]["Enums"]["currency"];
          description?: string | null;
          item?: number;
          material_code?: string;
          measurement_unit?: string;
          net_price?: number | null;
          purchase_order?: string;
          quantity?: number;
          supplier_id?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "base_bills_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["supplier_id"];
          },
        ];
      };
      invoice_data: {
        Row: {
          approved: boolean;
          created_at: string;
          invoice_id: string;
          last_modified_by: string | null;
          supplier_id: number;
          updated_at: string;
        };
        Insert: {
          approved?: boolean;
          created_at?: string;
          invoice_id?: string;
          last_modified_by?: string | null;
          supplier_id: number;
          updated_at?: string;
        };
        Update: {
          approved?: boolean;
          created_at?: string;
          invoice_id?: string;
          last_modified_by?: string | null;
          supplier_id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoice_data_last_modified_by_fkey";
            columns: ["last_modified_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["profile_id"];
          },
          {
            foreignKeyName: "invoice_data_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["supplier_id"];
          },
        ];
      };
      materials: {
        Row: {
          created_at: string;
          material_code: string;
          measurement_unit: string | null;
          subheading: string | null;
          type: Database["public"]["Enums"]["material_type"] | null;
          material_search: string | null;
        };
        Insert: {
          created_at?: string;
          material_code: string;
          measurement_unit?: string | null;
          subheading?: string | null;
          type?: Database["public"]["Enums"]["material_type"] | null;
        };
        Update: {
          created_at?: string;
          material_code?: string;
          measurement_unit?: string | null;
          subheading?: string | null;
          type?: Database["public"]["Enums"]["material_type"] | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string | null;
          email: string | null;
          full_name: string | null;
          profile_id: string;
          updated_at: string | null;
          user_role: "administrator" | "employee" | "guest" | null;
        };
        Insert: {
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          profile_id: string;
          updated_at?: string | null;
          user_role?: "administrator" | "employee" | "guest" | null;
        };
        Update: {
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          profile_id?: string;
          updated_at?: string | null;
          user_role?: "administrator" | "employee" | "guest" | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      supplier_data: {
        Row: {
          base_bill_id: string;
          bill_number: string;
          billed_quantity: number;
          billed_total_price: number;
          billed_unit_price: number;
          conversion_value: number;
          created_at: string;
          created_by: string | null;
          gross_weight: number;
          invoice_id: string;
          modified_at: string;
          packages: number;
          supplier_data_id: string;
          supplier_employee_id: number | null;
          trm: number;
          supplier_data_search: string | null;
        };
        Insert: {
          base_bill_id: string;
          bill_number: string;
          billed_quantity: number;
          billed_total_price: number;
          billed_unit_price: number;
          conversion_value: number;
          created_at?: string;
          created_by?: string | null;
          gross_weight: number;
          invoice_id: string;
          modified_at?: string;
          packages: number;
          supplier_data_id?: string;
          supplier_employee_id?: number | null;
          trm: number;
        };
        Update: {
          base_bill_id?: string;
          bill_number?: string;
          billed_quantity?: number;
          billed_total_price?: number;
          billed_unit_price?: number;
          conversion_value?: number;
          created_at?: string;
          created_by?: string | null;
          gross_weight?: number;
          invoice_id?: string;
          modified_at?: string;
          packages?: number;
          supplier_data_id?: string;
          supplier_employee_id?: number | null;
          trm?: number;
        };
        Relationships: [
          {
            foreignKeyName: "supplier_data_base_bill_id_fkey";
            columns: ["base_bill_id"];
            isOneToOne: false;
            referencedRelation: "base_bills";
            referencedColumns: ["base_bill_id"];
          },
          {
            foreignKeyName: "supplier_data_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["profile_id"];
          },
          {
            foreignKeyName: "supplier_data_invoice_id_fkey";
            columns: ["invoice_id"];
            isOneToOne: false;
            referencedRelation: "invoice_data";
            referencedColumns: ["invoice_id"];
          },
          {
            foreignKeyName: "supplier_data_supplier_employee_id_fkey";
            columns: ["supplier_employee_id"];
            isOneToOne: false;
            referencedRelation: "supplier_employees";
            referencedColumns: ["supplier_employee_id"];
          },
        ];
      };
      supplier_employees: {
        Row: {
          created_at: string;
          profile_id: string;
          supplier_employee_id: number;
          supplier_id: number;
        };
        Insert: {
          created_at?: string;
          profile_id: string;
          supplier_employee_id?: number;
          supplier_id: number;
        };
        Update: {
          created_at?: string;
          profile_id?: string;
          supplier_employee_id?: number;
          supplier_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "supplier_employees_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["profile_id"];
          },
          {
            foreignKeyName: "supplier_employees_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["supplier_id"];
          },
        ];
      };
      suppliers: {
        Row: {
          created_at: string;
          domain: string | null;
          name: string;
          supplier_id: number;
          supplier_search: string | null;
        };
        Insert: {
          created_at?: string;
          domain?: string | null;
          name: string;
          supplier_id?: number;
        };
        Update: {
          created_at?: string;
          domain?: string | null;
          name?: string;
          supplier_id?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      base_bill_search: {
        Args: {
          "": unknown;
        };
        Returns: string;
      };
      can_touch_supplier_data: {
        Args: {
          permission_value?: unknown;
          supplier_data_id?: string;
        };
        Returns: boolean;
      };
      material_search: {
        Args: {
          "": unknown;
        };
        Returns: string;
      };
      role_has_permission: {
        Args: {
          table_name: string;
          user_permission?: unknown;
          user_role?: "administrator" | "employee" | "guest";
        };
        Returns: boolean;
      };
      supplier_data_search: {
        Args: {
          "": unknown;
        };
        Returns: string;
      };
      supplier_search: {
        Args: {
          "": unknown;
        };
        Returns: string;
      };
      user_is: {
        Args: {
          user_role?: "administrator" | "employee" | "guest";
          user_id?: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_options: "trm_usd" | "trm_eur";
      currency: "COP" | "USD" | "EUR";
      material_type: "national" | "foreign" | "nationalized" | "other";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends (
    { schema: keyof Database }
  ) ?
    keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never,
> =
  PublicTableNameOrOptions extends { schema: keyof Database } ?
    (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends (
      {
        Row: infer R;
      }
    ) ?
      R
    : never
  : PublicTableNameOrOptions extends (
    keyof (PublicSchema["Tables"] & PublicSchema["Views"])
  ) ?
    (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends (
      {
        Row: infer R;
      }
    ) ?
      R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends (
    { schema: keyof Database }
  ) ?
    keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> =
  PublicTableNameOrOptions extends { schema: keyof Database } ?
    Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends (
      {
        Insert: infer I;
      }
    ) ?
      I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"] ?
    PublicSchema["Tables"][PublicTableNameOrOptions] extends (
      {
        Insert: infer I;
      }
    ) ?
      I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends (
    { schema: keyof Database }
  ) ?
    keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> =
  PublicTableNameOrOptions extends { schema: keyof Database } ?
    Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends (
      {
        Update: infer U;
      }
    ) ?
      U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"] ?
    PublicSchema["Tables"][PublicTableNameOrOptions] extends (
      {
        Update: infer U;
      }
    ) ?
      U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database } ?
    keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> =
  PublicEnumNameOrOptions extends { schema: keyof Database } ?
    Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"] ?
    PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;