import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { cn } from "@/lib/utils";

/** ── Types ─────────────────────────────────────────────────── */

type ToastVariant = "default" | "success" | "destructive" | "warning";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  toast: (message: string, opts?: { variant?: ToastVariant; duration?: number }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** ── Styling maps ─────────────────────────────────────────── */

const variantStyles: Record<ToastVariant, { container: string; text: string }> = {
  default: {
    container: "bg-ink border-2 border-ink",
    text: "text-cream",
  },
  success: {
    container: "bg-emerald-100 border-2 border-emerald-400",
    text: "text-emerald-800",
  },
  destructive: {
    container: "bg-destructive border-2 border-destructive",
    text: "text-white",
  },
  warning: {
    container: "bg-amber-100 border-2 border-amber-400",
    text: "text-amber-800",
  },
};

/** ── Single animated toast bar ────────────────────────────── */

function ToastBar({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const translateY = useRef(new Animated.Value(-120)).current;

  const slideIn = useCallback(() => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 18,
      stiffness: 200,
    }).start();
  }, [translateY]);

  const slideOut = useCallback(() => {
    Animated.timing(translateY, {
      toValue: -120,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [translateY]);

  useEffect(() => {
    slideIn();
    if (toast.duration > 0) {
      const timer = setTimeout(() => {
        slideOut();
        setTimeout(() => onDismiss(toast.id), 250);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const styles = variantStyles[toast.variant];

  return (
    <Animated.View
      style={[{ transform: [{ translateY }] }]}
      className="absolute top-0 left-4 right-4 z-50"
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => {
          slideOut();
          setTimeout(() => onDismiss(toast.id), 250);
        }}
      >
        <View
          className={cn(
            "rounded-xl px-5 py-3.5",
            styles.container,
          )}
          style={shadowBrutalSm}
        >
          <Text className={cn("font-sans text-base font-medium", styles.text)}>
            {toast.message}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

/** ── Hard shadow helper (mirrored from card.tsx) ──────────── */

const shadowBrutalSm = {
  shadowColor: "#262626",
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 2,
};

/** ── Provider ─────────────────────────────────────────────── */

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, opts?: { variant?: ToastVariant; duration?: number }) => {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      setToasts((prev) => [
        ...prev,
        {
          id,
          message,
          variant: opts?.variant ?? "default",
          duration: opts?.duration ?? 3500,
        },
      ]);
    },
    [],
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast stack rendered on top of everything */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none" className="pt-14">
        {toasts.map((t) => (
          <ToastBar key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

/** ── Hook ─────────────────────────────────────────────────── */

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a <ToastProvider>");
  }
  return ctx;
}
