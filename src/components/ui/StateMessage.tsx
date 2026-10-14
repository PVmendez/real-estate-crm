import type { ReactNode } from "react";

/** Estado vacío, de error o de "no encontrado": siempre dice qué pasó y qué se puede hacer. */
export function StateMessage({
  icon,
  title,
  children,
  action,
  tone = "neutral",
  role,
}: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  tone?: "neutral" | "danger";
  role?: "alert" | "status";
}) {
  return (
    <div role={role} className="flex flex-col items-center px-4 py-12 text-center">
      <div
        aria-hidden="true"
        className={`mb-4 flex size-11 items-center justify-center rounded-full ${
          tone === "danger" ? "bg-danger-soft text-danger" : "bg-sunken text-ink-muted"
        }`}
      >
        {icon}
      </div>
      <p className="text-lg font-semibold text-ink">{title}</p>
      {children && <div className="mt-1.5 max-w-sm text-sm text-ink-muted">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
