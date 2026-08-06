const LOGO_URL = "/afrokernel-logo.png";

export function Logo({ size = 40, showWordmark = true }: { size?: number; showWordmark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-full bg-primary/10 ring-2 ring-primary/40 shadow-[0_0_30px_-10px_var(--primary)]"
        style={{ width: size, height: size }}
      >
        <img
          src={LOGO_URL}
          alt="AfroKernel mascot"
          className="h-full w-full object-cover"
        />
      </div>
      {showWordmark && (
        <span className="font-display text-lg font-bold tracking-tight">
          Afro<span className="text-primary">Kernel</span>
        </span>
      )}
    </div>
  );
}
