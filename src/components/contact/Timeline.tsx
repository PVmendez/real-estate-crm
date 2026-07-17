import { Badge } from "@/components/Badge";
import { normalizeChannel, formatDateTime, parseFlexibleDate } from "@/lib/normalize";
import type { Interaction } from "@/lib/types";
import { TranscriptToggle } from "./TranscriptToggle";

export function Timeline({ interactions }: { interactions: Interaction[] }) {
  if (interactions.length === 0) {
    return (
      <Section title="Interacciones">
        <p className="text-sm text-zinc-400">Sin interacciones registradas todavía.</p>
      </Section>
    );
  }

  const sorted = [...interactions].sort((a, b) => {
    const da = parseFlexibleDate(a.created_at)?.getTime() ?? 0;
    const db = parseFlexibleDate(b.created_at)?.getTime() ?? 0;
    return db - da;
  });

  return (
    <Section title="Interacciones">
      <ol className="space-y-4">
        {sorted.map((interaction) => {
          const channel = normalizeChannel(interaction.channel);
          const duration = interaction.metadata?.duration_sec;
          const transcript = interaction.metadata?.transcript_excerpt;
          const propertyRef = interaction.metadata?.property_ref;

          return (
            <li key={interaction.id} className="border-l-2 border-zinc-100 pl-4 dark:border-zinc-800">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge className={channel.colorClass}>{channel.label}</Badge>
                <span className="text-zinc-400">{interaction.direction === "inbound" ? "recibido" : "enviado"}</span>
                <span className="text-zinc-400">·</span>
                <span className="text-zinc-400">{formatDateTime(interaction.created_at)}</span>
                {typeof duration === "number" && <span className="text-zinc-400">· {Math.round(duration / 60)} min</span>}
              </div>
              <p className="mt-1.5 text-sm text-zinc-700 dark:text-zinc-300">{interaction.content}</p>
              {typeof propertyRef === "string" && (
                <p className="mt-1 text-xs text-zinc-400">Ref. propiedad: {propertyRef}</p>
              )}
              {typeof transcript === "string" && <TranscriptToggle transcript={transcript} />}
            </li>
          );
        })}
      </ol>
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
