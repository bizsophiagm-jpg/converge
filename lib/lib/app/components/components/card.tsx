import { ReactNode } from "react";

export function Card({ title, subtitle, right, children }: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{title}</div>
          {subtitle ? <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div> : null}
        </div>
        {right}
      </div>
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}
