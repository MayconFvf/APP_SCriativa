import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

type LogoProps = {
  to?: string;
  compact?: boolean;
  tone?: "dark" | "light";
};

export function Logo({ to = "/", compact = false }: LogoProps) {
  return (
    <Link to={to} className="flex min-w-0 items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/[0.15] bg-gradient-to-br from-coral via-magenta to-denim text-white shadow-neon">
        <Sparkles size={20} strokeWidth={2.4} aria-hidden="true" />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block truncate text-sm font-black uppercase tracking-[0.18em] text-white">
            SCRIATIVA
          </span>
          <span className="block truncate text-xs font-semibold text-white/[0.52]">
            Orçamentos
          </span>
        </span>
      )}
    </Link>
  );
}
