import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

interface BackToHomeProps {
  className?: string;
  label?: string;
}

export function BackToHome({ className = "", label = "Back to Home" }: BackToHomeProps) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group mb-4 py-1 px-2.5 rounded-lg hover:bg-secondary/60 w-fit border border-border/40 hover:border-border ${className}`}
      title="Return to AfroKernel Home"
    >
      <ArrowLeft className="h-3 w-3 text-primary transition-transform duration-150 group-hover:-translate-x-1" />
      <span>{label}</span>
    </Link>
  );
}
