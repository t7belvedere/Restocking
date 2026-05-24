import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";
import { supabase } from "./supabase";
import type { Session, User } from "@supabase/supabase-js";
import { router, useSegments, useRootNavigationState } from "expo-router";

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthState>({
  session: null,
  user: null,
  loading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => {},
  resetPassword: async () => ({}),
  signInWithGoogle: async () => ({}),
});

export function useAuth() {
  return useContext(AuthContext);
}

function useProtectedRoute(user: User | null, loading: boolean) {
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key || loading) return;

    const segment = segments[0] as string | undefined;
    const inAuthGroup = segment === "(auth)" || segment === "callback";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [user, segments, navigationState?.key, loading]);
}

async function signInWithGoogleNative(): Promise<{ error?: string }> {
  const WebBrowser = require("expo-web-browser");
  const AuthSession = require("expo-auth-session");

  WebBrowser.maybeCompleteAuthSession();

  const redirectTo = AuthSession.makeRedirectUri();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });

  if (error) return { error: error.message };
  if (!data?.url) return { error: "Failed to start Google sign in." };

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === "cancel") return { error: "Sign in cancelled." };
  if (result.type !== "success" || !result.url)
    return { error: "Failed to complete Google sign in." };

  const codeMatch = result.url.match(/[?&]code=([^&]*)/);
  const code = codeMatch ? decodeURIComponent(codeMatch[1]) : null;
  if (!code) return { error: "No auth code in callback." };

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) return { error: exchangeError.message };

  return {};
}

async function signInWithGoogleWeb(): Promise<{ error?: string }> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/callback",
    },
  });
  if (error) return { error: error.message };
  return {};
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useProtectedRoute(user, loading);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
    return {};
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { error: error.message };
    return {};
  };

  const signInWithGoogle =
    Platform.OS === "web" ? signInWithGoogleWeb : signInWithGoogleNative;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
