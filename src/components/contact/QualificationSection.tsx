import { ClipboardList, FileWarning } from "lucide-react";
import { Badge, type Tone } from "@/components/ui/Badge";
import { Section } from "@/components/ui/Section";
import { StateMessage } from "@/components/ui/StateMessage";
import { formatFactValue, parseQualificationData, provenanceInfo, type ProvenanceKind } from "@/lib/qualification";
import { formatDate } from "@/lib/normalize";
import type { Contact } from "@/lib/types";

const PROVENANCE_TONES: Record<ProvenanceKind, Tone> = {
  human: "accent",
  ai: "info",
  import: "neutral",
  unknown: "neutral",
};

const CONFIDENCE_LABELS: Record<string, string> = { high: "confianza alta", medium: "confianza media", low: "confianza baja" };

export function QualificationSection({ contact }: { contact: Contact }) {
  const { groups, parseError } = parseQualificationData(contact.qualification_data);

  return (
    <Section id="cualificacion" title="Cualificación" description="Qué busca, con qué presupuesto y de dónde sale cada dato.">
      {parseError ? (
        <StateMessage role="alert" tone="danger" icon={<FileWarning className="size-5" />} title="Formato inválido">
          Los datos de cualificación llegaron como texto que no es JSON válido y no se pudieron interpretar.
        </StateMessage>
      ) : groups.length === 0 ? (
        <StateMessage icon={<ClipboardList className="size-5" />} title="Sin datos de cualificación">
          Todavía no sabemos qué busca este contacto.
        </StateMessage>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {groups.map((group) => (
            <div key={group.operation}>
              <h3 className="mb-2 font-mono text-xs font-medium tracking-[0.12em] text-ink-muted uppercase">{group.label}</h3>
              <dl className="divide-y divide-line">
                {group.facts.map(({ key, label, fact }) => {
                  const provenance = provenanceInfo(fact.source, fact.sourceRef);
                  return (
                    <div key={key} className="py-2.5">
                      <dt className="text-xs text-ink-subtle">{label}</dt>
                      <dd className="mt-0.5">
                        <p className="text-sm font-medium text-pretty text-ink">{formatFactValue(key, fact.value)}</p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-subtle">
                          <Badge tone={PROVENANCE_TONES[provenance.kind]}>{provenance.label}</Badge>
                          {fact.confidence && <span>{CONFIDENCE_LABELS[fact.confidence] ?? fact.confidence}</span>}
                          {fact.updatedAt && <span>{formatDate(fact.updatedAt)}</span>}
                        </p>
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}
