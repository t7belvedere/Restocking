export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      watches: {
        Row: {
          id: string;
          user_id: string;
          url: string;
          name: string | null;
          image_url: string | null;
          price: number | null;
          variant_label: string | null;
          variant_id: string | null;
          last_status: "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
          last_check: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          url: string;
          name?: string | null;
          image_url?: string | null;
          price?: number | null;
          variant_label?: string | null;
          variant_id?: string | null;
          last_status?: "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
          last_check?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          url?: string;
          name?: string | null;
          image_url?: string | null;
          price?: number | null;
          variant_label?: string | null;
          variant_id?: string | null;
          last_status?: "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
          last_check?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      check_logs: {
        Row: {
          id: string;
          watch_id: string;
          status: "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
          price: number | null;
          signal_source:
            | "dataLayer"
            | "add_to_cart_btn"
            | "variant_attr"
            | "playwright"
            | null;
          raw_signal: string | null;
          checked_at: string;
        };
        Insert: {
          id?: string;
          watch_id: string;
          status: "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
          price?: number | null;
          signal_source?:
            | "dataLayer"
            | "add_to_cart_btn"
            | "variant_attr"
            | "playwright"
            | null;
          raw_signal?: string | null;
          checked_at?: string;
        };
        Update: {
          id?: string;
          watch_id?: string;
          status?: "IN_STOCK" | "OUT_OF_STOCK" | "UNKNOWN";
          price?: number | null;
          signal_source?:
            | "dataLayer"
            | "add_to_cart_btn"
            | "variant_attr"
            | "playwright"
            | null;
          raw_signal?: string | null;
          checked_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          watch_id: string;
          channel: "email" | "sms";
          sent_at: string;
          success: boolean;
        };
        Insert: {
          id?: string;
          watch_id: string;
          channel: "email" | "sms";
          sent_at?: string;
          success?: boolean;
        };
        Update: {
          id?: string;
          watch_id?: string;
          channel?: "email" | "sms";
          sent_at?: string;
          success?: boolean;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: "free" | "pro";
          stripe_sub_id: string | null;
          current_period_end: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan?: "free" | "pro";
          stripe_sub_id?: string | null;
          current_period_end?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan?: "free" | "pro";
          stripe_sub_id?: string | null;
          current_period_end?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};
