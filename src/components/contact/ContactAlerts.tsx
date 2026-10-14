import Link from "next/link";
import { Ban, Copy, Hand } from "lucide-react";
import { Callout } from "@/components/ui/Callout";
import type { ConsentStatus, ContactChannel, DuplicateMatch } from "@/lib/derive";
import { resolveDisplayName } from "@/lib/normalize";
import type { Contact } from "@/lib/types";

const CHANNEL_LABELS: Record<ContactChannel, string> = { call: "llamada", whatsapp: "WhatsApp", email: "email" };

/** Lo que un agente tiene que saber antes de tocar este contacto, en orden de gravedad. */
export function ContactAlerts({
  contact,
  consent,
  duplicates,
}: {
  contact: Contact;
  consent: ConsentStatus;
  duplicates: DuplicateMatch[];
}) {
  if (!consent.blocked && !contact.ai_handoff && duplicates.length === 0) return null;

  return (
    <div className="space-y-3" role="region" aria-label="Avisos sobre este contacto">
      {consent.blocked && (
        <Callout tone="danger" icon={<Ban className="size-4" />} title="No contactar por los canales habituales">
          <p>{consent.reason}</p>
          <p className="mt-1 text-ink-muted">
            {consent.allowedChannels.length > 0
              ? `Único canal permitido: ${consent.allowedChannels.map((c) => CHANNEL_LABELS[c]).join(", ")}.`
              : "Ningún canal permitido."}
          </p>
        </Callout>
      )}

      {contact.ai_handoff && (
        <Callout tone="warn" icon={<Hand className="size-4" />} title="Pidió hablar con una persona">
          {contact.handoff_reason && <p>{contact.handoff_reason}</p>}
        </Callout>
      )}

      {duplicates.length > 0 && (
        <Callout tone="info" icon={<Copy className="size-4" />} title="Posible contacto duplicado">
          <ul className="space-y-0.5">
            {duplicates.map(({ contact: other, reason }) => (
              <li key={other.id}>
                <Link href={`/contacts/${other.id}`} className="font-medium underline underline-offset-4 hover:text-info">
                  {resolveDisplayName(other).name}
                </Link>{" "}
                <span className="text-ink-muted">
                  — mismo {reason === "telefono" ? "teléfono una vez normalizado" : "nombre"}
                </span>
              </li>
            ))}
          </ul>
        </Callout>
      )}
    </div>
  );
}
