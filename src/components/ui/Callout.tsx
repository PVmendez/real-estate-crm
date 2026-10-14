import type { ReactNode } from "react";

const TONES = {
  warn: "border-warn/30 bg-warn-soft text-warn",
  danger: "border-danger/30 bg-danger-soft text-danger",
  info: "border-info/30 bg-info-soft text-info",
} as const;

/** Aviso destacado de la ficha. El color nunca va solo: siempre lleva ícono y título explícito. */
export function Callout({
  tone,
  icon,
  title,
  children,
}: {
  tone: keyof typeof TONES;
  icon: ReactNode;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className={`flex items-start gap-3 rounded-lg border px-4 py-3.5 ${TONES[tone]}`}>
      <span aria-hidden="true" className="mt-0.5 shrink-0">
        {icon}
      </span>
      <div className="min-w-0 text-sm">
        <p className="font-semibold">{title}</p>
        {children && <div className="mt-0.5 text-ink">{children}</div>}
      </div>
    </div>
  );
}
