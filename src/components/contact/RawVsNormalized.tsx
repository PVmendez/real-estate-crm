import { ArrowRight } from "lucide-react";
import { Badge, type Tone } from "@/components/ui/Badge";
import { Section } from "@/components/ui/Section";
import type { FieldStatus, NormalizationReport, NormalizationRow } from "@/lib/report";

const STATUS: Record<FieldStatus, { label: string; tone: Tone }> = {
  clean: { label: "Sin cambios", tone: "neutral" },
  normalized: { label: "Normalizado", tone: "accent" },
  inferred: { label: "Inferido", tone: "info" },
  invalid: { label: "Inválido", tone: "danger" },
  missing: { label: "Falta", tone: "warn" },
};

/**
 * La pieza que explica el proyecto: cada campo tal como llegó del export, al lado de cómo lo muestra
 * la ficha y de la regla que lo transformó.
 */
export function RawVsNormalized({ report }: { report: NormalizationReport }) {
  const summary = [
    report.fixedCount > 0 && `${report.fixedCount} ${report.fixedCount === 1 ? "campo corregido" : "campos corregidos"}`,
    report.issueCount > 0 && `${report.issueCount} ${report.issueCount === 1 ? "dato inválido" : "datos inválidos"}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Section
      id="antes-despues"
      title="Antes y después"
      description="Cada dato tal como llegó del export, y cómo lo muestra esta ficha."
      aside={summary ? <p className="font-mono text-xs text-ink-muted">{summary}</p> : undefined}
    >
      <div
        aria-hidden="true"
        className="hidden grid-cols-[9rem_minmax(0,1fr)_1.5rem_minmax(0,1fr)] gap-x-4 border-b border-line pb-2 font-mono text-[11px] tracking-[0.12em] text-ink-subtle uppercase md:grid"
      >
        <span>Campo</span>
        <span>Crudo</span>
        <span />
        <span>Normalizado</span>
      </div>
      <ol className="divide-y divide-line">
        {report.rows.map((row) => (
          <Row key={row.field} row={row} />
        ))}
      </ol>
    </Section>
  );
}

function Row({ row }: { row: NormalizationRow }) {
  const status = STATUS[row.status];
  const longRaw = row.rawKind === "json" || (row.raw?.length ?? 0) > 80;

  return (
    <li className="grid grid-cols-1 gap-y-2 py-4 md:grid-cols-[9rem_minmax(0,1fr)_1.5rem_minmax(0,1fr)] md:gap-x-4">
      <div className="flex items-center justify-between gap-2 md:block">
        <h3 className="text-sm font-medium text-ink">{row.label}</h3>
        <span className="md:mt-1.5 md:block">
          <Badge tone={status.tone}>{status.label}</Badge>
        </span>
      </div>

      <div className="min-w-0">
        <p className="mb-1 text-xs text-ink-subtle md:sr-only">Crudo</p>
        {longRaw ? <LongRaw row={row} /> : <RawValue row={row} />}
      </div>

      <ArrowRight aria-hidden="true" className="mt-2 hidden size-4 text-ink-subtle md:block" />

      <div className="min-w-0">
        <p className="mb-1 text-xs text-ink-subtle md:sr-only">Normalizado</p>
        {row.normalized ? (
          <p className="pt-1.5 text-sm font-medium break-words text-ink tabular-nums">{row.normalized}</p>
        ) : (
          <p className="pt-1.5 text-sm text-ink-subtle">{row.status === "invalid" ? "No se usa" : "—"}</p>
        )}
        {row.detail && <p className="mt-0.5 font-mono text-xs text-ink-muted">{row.detail}</p>}
        <ul className="mt-2 space-y-1">
          {row.rules.map((rule) => (
            <li key={rule} className="flex gap-1.5 text-xs text-ink-muted">
              <span aria-hidden="true" className="text-ink-subtle">
                ↳
              </span>
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

const WELL = "rounded-md border border-line bg-sunken px-2.5 py-1.5 font-mono text-[13px] leading-relaxed text-ink";

function RawValue({ row }: { row: NormalizationRow }) {
  if (row.raw === null) {
    return (
      <code className={`${WELL} inline-block text-ink-subtle`}>
        null<span className="sr-only"> (vacío)</span>
      </code>
    );
  }
  // Las comillas dejan claro que es el literal del export, con sus espacios y signos tal cual.
  const literal = row.rawKind === "number" ? row.raw : `"${row.raw}"`;
  return <code className={`${WELL} inline-block max-w-full break-all whitespace-pre-wrap`}>{literal}</code>;
}

function LongRaw({ row }: { row: NormalizationRow }) {
  const kind = row.rawKind === "json" ? "objeto JSON" : "string";
  const size = `${row.raw!.length.toLocaleString("es-ES")} caracteres`;
  return (
    <details className="group">
      <summary className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-sm text-sm font-medium text-accent-ink hover:underline hover:underline-offset-4">
        <span className="group-open:hidden">Ver {kind}</span>
        <span className="hidden group-open:inline">Ocultar {kind}</span>
        <span className="font-mono text-xs font-normal text-ink-subtle">({size})</span>
      </summary>
      <pre className={`${WELL} mt-1.5 max-h-72 overflow-auto text-xs whitespace-pre-wrap break-all`} tabIndex={0} aria-label={`${row.label}: dato crudo`}>
        {row.raw}
      </pre>
    </details>
  );
}
