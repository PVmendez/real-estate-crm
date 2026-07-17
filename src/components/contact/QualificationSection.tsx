import { Badge } from "@/components/Badge";
import { formatFactValue, parseQualificationData, provenanceInfo } from "@/lib/qualification";
import { formatDate } from "@/lib/normalize";
import type { Contact } from "@/lib/types";

const PROVENANCE_CLASSES: Record<string, string> = {
  human: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  ai: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  import: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500",
  unknown: "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500",
};

export function QualificationSection({ contact }: { contact: Contact }) {
  const { groups, parseError } = parseQualificationData(contact.qualification_data);

  if (parseError) {
    return (
      <Section title="Cualificación">
        <p className="text-sm text-rose-600 dark:text-rose-400">
          Los datos de cualificación llegaron en un formato inválido y no se pudieron interpretar.
        </p>
      </Section>
    );
  }

  if (groups.length === 0) {
    return (
      <Section title="Cualificación">
        <p className="text-sm text-zinc-400">Todavía no hay datos de cualificación para este contacto.</p>
      </Section>
    );
  }

  return (
    <Section title="Cualificación">
      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map((group) => (
          <div key={group.operation} className="rounded-lg border border-zinc-200 p-3.5 dark:border-zinc-800">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">{group.label}</p>
            <dl className="space-y-2.5">
              {group.facts.map(({ key, label, fact }) => {
                const provenance = provenanceInfo(fact.source);
                return (
                  <div key={key} className="flex items-start justify-between gap-3 text-sm">
                    <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
                    <dd className="text-right">
                      <p className="font-medium text-zinc-900 dark:text-zinc-50">{formatFactValue(key, fact.value)}</p>
                      <div className="mt-0.5 flex items-center justify-end gap-1.5">
                        <Badge className={PROVENANCE_CLASSES[provenance.kind]}>{provenance.label}</Badge>
                        {fact.updatedAt && <span className="text-[11px] text-zinc-400">{formatDate(fact.updatedAt)}</span>}
                      </div>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
      {children}
    </div>
  );
}
