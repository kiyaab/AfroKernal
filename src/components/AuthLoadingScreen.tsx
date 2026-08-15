import { Loader2 } from "lucide-react";

/**
 * Premium full-screen loading state shown while verifying authentication.
 * Features a centered spinner with the AfroKernel pulse glow.
 */
export function AuthLoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 45%, oklch(0.86 0.17 92 / 0.1), transparent)",
        }}
      />

      {/* Pulsing ring */}
      <div className="relative flex items-center justify-center">
        <div
          className="absolute h-20 w-20 rounded-full border-2 border-primary/30"
          style={{ animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite" }}
        />
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 bg-card shadow-lg">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      </div>

      <p className="mt-6 font-mono text-sm tracking-widest uppercase text-muted-foreground">
        Verifying credentials…
      </p>
      <p className="mt-2 text-xs text-muted-foreground/60">
        You'll be redirected to sign in if needed.
      </p>

      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
