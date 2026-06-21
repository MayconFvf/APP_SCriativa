import type { ReactNode } from "react";

type PageIntroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
};

export function PageIntro({ eyebrow, title, description, children }: PageIntroProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow && (
          <p className="text-xs font-black uppercase tracking-[0.18em] text-aqua">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">
          {title}
        </h1>
        {description && <p className="mt-3 text-base leading-7 text-white/[0.62]">{description}</p>}
      </div>
      {children && (
        <div className="w-full md:w-auto md:shrink-0 [&>*]:w-full md:[&>*]:w-auto">
          {children}
        </div>
      )}
    </div>
  );
}
