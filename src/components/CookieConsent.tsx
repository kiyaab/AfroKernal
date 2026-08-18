import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie, ShieldCheck, Check, X } from "lucide-react";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("afrokernel-cookie-consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem(
      "afrokernel-cookie-consent",
      JSON.stringify({ analytics: true, essential: true, acceptedAt: new Date().toISOString() }),
    );
    setVisible(false);
  };

  const acceptEssential = () => {
    localStorage.setItem(
      "afrokernel-cookie-consent",
      JSON.stringify({ analytics: false, essential: true, acceptedAt: new Date().toISOString() }),
    );
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:max-w-md z-50 p-5 rounded-2xl glass border border-primary/30 shadow-[var(--shadow-card)] bg-background/95 backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
          <Cookie className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold font-display flex items-center justify-between">
            Cookie & Privacy Preferences
            <button
              onClick={acceptEssential}
              className="text-muted-foreground hover:text-foreground text-xs p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </h3>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            We use essential cookies to maintain your login session, progress, and lab terminal
            states. By continuing, you agree to our{" "}
            <Link to="/terms" className="text-primary underline font-medium hover:brightness-110">
              Terms & Privacy Policy
            </Link>
            .
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={acceptAll}
              className="px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" /> Accept All
            </button>
            <button
              onClick={acceptEssential}
              className="px-3.5 py-1.5 rounded-lg border border-border bg-card/60 hover:bg-accent text-xs font-medium transition flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" /> Essential Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
