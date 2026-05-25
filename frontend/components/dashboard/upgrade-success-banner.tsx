"use client";

import { useEffect, useState, useCallback } from "react";
import { X, PartyPopper, Zap, Mail, Clock, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  delay: number;
  shape: "circle" | "square" | "triangle";
}

const COLORS = [
  "var(--brand-orange)",
  "var(--brand-lime)",
  "var(--brand-blue)",
  "#FF6B6B",
  "#A855F7",
  "var(--ink)",
  "#F59E0B",
];

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10 - Math.random() * 20,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 5 + Math.random() * 8,
    rotation: Math.random() * 360,
    delay: Math.random() * 2,
    shape: (["circle", "square", "triangle"] as const)[Math.floor(Math.random() * 3)],
  }));
}

export function UpgradeSuccessBanner() {
  const t = useTranslations();
  const [visible, setVisible] = useState(true);
  const [particles] = useState(() => createParticles(60));
  const [fadeOut, setFadeOut] = useState(false);

  const dismiss = useCallback(() => {
    setFadeOut(true);
    setTimeout(() => setVisible(false), 400);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setVisible(false), 400);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Confetti */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      >
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute animate-confetti-fall"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.shape !== "triangle" ? p.color : "transparent",
              borderLeft:
                p.shape === "triangle"
                  ? `${p.size / 2}px solid transparent`
                  : undefined,
              borderRight:
                p.shape === "triangle"
                  ? `${p.size / 2}px solid transparent`
                  : undefined,
              borderBottom:
                p.shape === "triangle"
                  ? `${p.size}px solid ${p.color}`
                  : undefined,
              borderRadius: p.shape === "circle" ? "50%" : p.shape === "square" ? "2px" : undefined,
              transform: `rotate(${p.rotation}deg)`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${2.5 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Banner */}
      <div
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-400 ${
          fadeOut ? "opacity-0 -translate-y-2" : "opacity-100"
        }`}
      >
        <div className="mx-auto mt-4 max-w-2xl px-4">
          <div className="relative overflow-hidden rounded-3xl border-2 border-ink bg-[var(--brand-lime)] p-6 shadow-brutal-lg">
            {/* BG decoration */}
            <div
              aria-hidden
              className="absolute -right-8 -top-8 h-32 w-32 rotate-12 rounded-full bg-[var(--brand-orange)]/30"
            />
            <div
              aria-hidden
              className="absolute -bottom-4 -left-4 h-20 w-20 -rotate-6 rounded-2xl bg-[var(--brand-blue)]/30"
            />

            <div className="relative flex items-start gap-4">
              <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-ink bg-paper shadow-brutal-sm">
                <PartyPopper className="h-7 w-7 text-[var(--brand-orange)]" />
              </span>

              <div className="flex-1 min-w-0">
                <h2 className="font-display text-xl font-extrabold tracking-tight text-ink">
                  {t("dashboard.upgradeBannerTitle")}
                </h2>
                <p className="mt-1 text-sm text-ink/70">
                  {t("dashboard.upgradeBannerSub")}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    {
                      icon: Zap,
                      label: t("dashboard.upgradeBannerCheck"),
                    },
                    {
                      icon: Mail,
                      label: t("dashboard.upgradeBannerSMS"),
                    },
                    {
                      icon: Clock,
                      label: t("dashboard.upgradeBannerAlerts"),
                    },
                    {
                      icon: TrendingUp,
                      label: t("dashboard.upgradeBannerHistory"),
                    },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 rounded-xl border-2 border-ink/20 bg-paper/50 px-3 py-2"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--brand-orange)]" />
                      <span className="text-xs font-semibold text-ink/80">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={dismiss}
                className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink/20 bg-paper/50 text-ink/50 transition-colors hover:bg-paper hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti-fall {
          animation: confetti-fall 3.5s ease-in forwards;
        }
      `}</style>
    </>
  );
}
