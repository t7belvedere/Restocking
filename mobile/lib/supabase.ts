import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const msg = `Supabase env vars missing. URL: ${!!supabaseUrl}, Key: ${!!supabaseAnonKey}`;
  if (Platform.OS === "web") {
    console.error(msg);
  }
  // On native, show the error visibly instead of silent crash
  throw new Error(msg);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
