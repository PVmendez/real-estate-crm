import { ArrowDownLeft, ArrowUpRight, MessagesSquare } from "lucide-react";
import { ChannelBadge } from "@/components/ui/ChannelBadge";
import { Section } from "@/components/ui/Section";
import { StateMessage } from "@/components/ui/StateMessage";
import { formatDateTime, normalizeChannel, parseFlexibleDate } from "@/lib/normalize";
import type { Interaction } from "@/lib/types";
import { TranscriptToggle } from "./TranscriptToggle";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m} min ${s} s` : `${s} s`;
}

export function Timeline({ interactions }: { interactions: Interaction[] }) {
  const sorted = [...interactions].sort(
    (a, b) => (parseFlexibleDate(b.created_at)?.getTime() ?? 0) - (parseFlexibleDate(a.created_at)?.getTime() ?? 0),
  );

  return (
    <Section
      id="interacciones"
      title="Interacciones"
      description={
        sorted.length > 1
          ? `${sorted.length} registradas, de la más reciente a la más antigua.`
          : sorted.length === 1
            ? "1 registrada."
            : undefined
      }
    >
      {sorted.length === 0 ? (
        <StateMessage icon={<MessagesSquare className="size-5" />} title="Sin interacciones">
          Todavía no hay llamadas ni mensajes con este contacto.
        </StateMessage>
      ) : (
        <ol className="relative space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-px before:bg-line">
          {sorted.map((interaction) => {
            const inbound = interaction.direction === "inbound";
            const Direction = inbound ? ArrowDownLeft : ArrowUpRight;
            const duration = interaction.metadata?.duration_sec;
            const transcript = interaction.metadata?.transcript_excerpt;
            const propertyRef = interaction.metadata?.property_ref;
            const date = parseFlexibleDate(interaction.created_at);

            return (
              <li key={interaction.id} className="relative pl-7">
                <span
                  aria-hidden="true"
                  className="absolute top-1 left-0 flex size-[15px] items-center justify-center rounded-full border border-line-strong bg-surface"
                >
                  <span className={`size-[7px] rounded-full ${inbound ? "bg-accent" : "bg-line-strong"}`} />
                </span>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <ChannelBadge {...normalizeChannel(interaction.channel)} />
                  <span className="inline-flex items-center gap-1 text-ink-muted">
                    <Direction aria-hidden="true" className="size-3.5" />
                    {inbound ? "Entrante" : "Saliente"}
                  </span>
                  <time dateTime={date?.toISOString()} className="text-ink-subtle tabular-nums">
                    {formatDateTime(interaction.created_at)}
                  </time>
                  {typeof duration === "number" && <span className="text-ink-subtle">· {formatDuration(duration)}</span>}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-pretty text-ink">{interaction.content}</p>
                {typeof propertyRef === "string" && (
                  <p className="mt-1.5 text-xs text-ink-muted">
                    Inmueble de referencia: <span className="font-mono">{propertyRef}</span>
                  </p>
                )}
                {typeof transcript === "string" && <TranscriptToggle transcript={transcript} />}
              </li>
            );
          })}
        </ol>
      )}
    </Section>
  );
}
