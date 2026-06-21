import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <section className="glass-panel mt-8 p-5 sm:p-8">
      <div className="flex max-w-2xl flex-col gap-4 sm:flex-row sm:items-center">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-coral to-magenta text-white shadow-neon">
          <Icon size={24} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-xl font-black text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-white/[0.58]">{description}</p>
        </div>
      </div>
    </section>
  );
}
