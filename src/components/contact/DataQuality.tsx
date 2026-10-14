import { Check, X } from "lucide-react";
import { Section } from "@/components/ui/Section";
import type { HealthReport } from "@/lib/derive";

export function DataQuality({ health }: { health: HealthReport }) {
  const level = health.score >= 80 ? "ok" : health.score >= 50 ? "warn" : "danger";
  const bar = { ok: "bg-ok", warn: "bg-warn", danger: "bg-danger" }[level];
  const verdict = { ok: "Ficha completa", warn: "Ficha incompleta", danger: "Ficha muy incompleta" }[level];

  return (
    <Section id="calidad" title="Completitud de la ficha" description={verdict}>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-semibold tabular-nums text-ink">{health.score}</span>
        <span className="text-sm text-ink-muted">/ 100</span>
      </div>
      <div
        role="meter"
        aria-label="Completitud de la ficha"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={health.score}
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-sunken"
      >
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${health.score}%` }} />
      </div>
      <ul className="mt-4 space-y-2 text-sm">
        {health.items.map((item) => (
          <li key={item.label} className="flex items-start gap-2">
            {item.ok ? (
              <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ok" />
            ) : (
              <X aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-subtle" />
            )}
            <span className={item.ok ? "text-ink" : "text-ink-muted"}>
              <span className="sr-only">{item.ok ? "Cumple: " : "Falta: "}</span>
              {item.label}
            </span>
            <span className="ml-auto font-mono text-xs tabular-nums text-ink-subtle">
              {item.ok ? `+${item.points}` : `0/${item.points}`}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
