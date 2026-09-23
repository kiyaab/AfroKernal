import { createFileRoute, Link } from "@tanstack/react-router";
import { HeaderNav } from "@/components/HeaderNav";
import { FooterNav } from "@/components/FooterNav";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/certification")({
  head: () => ({
    meta: [{ title: "Courses & Curriculum — AfroKernel" }],
  }),
  component: CertificationRedirect,
});

function CertificationRedirect() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeaderNav />
      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <div className="text-4xl">📚</div>
          <h1 className="text-2xl font-bold font-display text-foreground">
            Explore Linux Courses & Labs
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            AfroKernel provides 100% free hands-on Linux training with in-browser terminal sandboxes
            and practical lessons.
          </p>
          <div className="pt-2">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:brightness-110 transition shadow-sm"
            >
              Browse Course Catalog <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
      <FooterNav />
    </div>
  );
}
