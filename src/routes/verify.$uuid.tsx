import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  Download,
  Calendar,
  User,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import jsPDF from "jspdf";

export const Route = createFileRoute("/verify/$uuid")({
  component: CertificateVerification,
});

function CertificateVerification() {
  const params = Route.useParams() as { uuid?: string };
  const uuid = params?.uuid;
  const [downloading, setDownloading] = useState(false);

  // Verification details based on UUID or fallback
  const certDetails = {
    uuid: uuid || "ak-84920-cert",
    candidateName: "Verified Linux Learner",
    trackName: "Linux Fundamentals Certified Administrator",
    score: 92,
    totalQuestions: 50,
    issuedDate: "August 14, 2026",
    status: "Active & Valid",
    issuer: "AfroKernel Linux Certification Authority",
  };

  const handleDownloadPdf = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Background
      doc.setFillColor(15, 23, 42); // Dark slate
      doc.rect(0, 0, 297, 210, "F");

      // Inner border
      doc.setDrawColor(234, 179, 8); // Gold / Primary
      doc.setLineWidth(2);
      doc.rect(10, 10, 277, 190);

      // Title
      doc.setTextColor(234, 179, 8);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.text("AFROKERNEL CERTIFICATE OF EXCELLENCE", 148.5, 45, { align: "center" });

      // Subtitle
      doc.setTextColor(203, 213, 225);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.text("This official credential is proudly awarded to", 148.5, 65, { align: "center" });

      // Candidate Name
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text(certDetails.candidateName, 148.5, 85, { align: "center" });

      // Achievement
      doc.setTextColor(203, 213, 225);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.text(
        "for successfully demonstrating mastery and passing the rigorous exam for",
        148.5,
        105,
        { align: "center" },
      );

      // Track Name
      doc.setTextColor(234, 179, 8);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text(certDetails.trackName, 148.5, 125, { align: "center" });

      // Score & Date
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(11);
      doc.text(
        `Score: ${certDetails.score}% | Date Issued: ${certDetails.issuedDate}`,
        148.5,
        145,
        { align: "center" },
      );
      doc.text(`Credential ID: ${certDetails.uuid}`, 148.5, 155, { align: "center" });

      // Issuer footer
      doc.setTextColor(203, 213, 225);
      doc.setFont("helvetica", "bold");
      doc.text("AfroKernel Certification Authority", 148.5, 180, { align: "center" });

      doc.save(`AfroKernel_Certificate_${certDetails.uuid}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>

      <div className="rounded-3xl border border-border bg-card p-8 md:p-12 shadow-2xl space-y-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 block">
                Official Credential Verified
              </span>
              <h1 className="text-2xl font-bold text-foreground">Certificate Verification</h1>
            </div>
          </div>

          <div className="font-mono text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-xl self-start sm:self-auto">
            UUID: <strong className="text-foreground">{certDetails.uuid}</strong>
          </div>
        </div>

        {/* Certificate Details Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-border bg-background/50 space-y-1">
            <span className="text-xs text-muted-foreground block flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-primary" /> Recipient Name
            </span>
            <span className="font-bold text-base text-foreground">{certDetails.candidateName}</span>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-background/50 space-y-1">
            <span className="text-xs text-muted-foreground block flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-primary" /> Certification Track
            </span>
            <span className="font-bold text-base text-primary">{certDetails.trackName}</span>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-background/50 space-y-1">
            <span className="text-xs text-muted-foreground block flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Examination Score
            </span>
            <span className="font-bold text-base text-emerald-500">
              {certDetails.score}% (Passed with Distinction)
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-background/50 space-y-1">
            <span className="text-xs text-muted-foreground block flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-primary" /> Issue Date
            </span>
            <span className="font-bold text-base text-foreground">{certDetails.issuedDate}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Issued by <strong className="text-foreground">{certDetails.issuer}</strong>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:brightness-110 transition shadow-[var(--shadow-glow)] flex items-center gap-2"
            >
              <Download className="h-4 w-4" />{" "}
              {downloading ? "Generating PDF..." : "Download Official PDF"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
