import { Menu } from "lucide-react";
import { NavLink } from "react-router-dom";
import { publicNavItems } from "../../config/navigation";
import { Logo } from "../brand/Logo";

const publicLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-lg px-3 py-2 text-sm font-bold transition",
    isActive
      ? "bg-white text-ink"
      : "text-white/[0.68] hover:bg-white/10 hover:text-white"
  ].join(" ");

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/[0.78] backdrop-blur-xl">
      <div className="section-shell flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 rounded-lg border border-white/10 bg-white/[0.08] p-1 shadow-line md:flex">
          {publicNavItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={publicLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <details className="group relative md:hidden">
          <summary className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-lg border border-white/10 bg-white/10 text-white shadow-line marker:hidden">
            <Menu size={21} aria-hidden="true" />
          </summary>
          <nav className="fixed left-4 right-4 top-16 grid max-h-[calc(100svh-5rem)] gap-1 overflow-y-auto rounded-lg border border-white/10 bg-night p-2 shadow-soft">
            {publicNavItems.map((item) => (
              <NavLink key={item.path} to={item.path} className={publicLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
