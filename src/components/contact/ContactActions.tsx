import { normalizePhone } from "@/lib/normalize";
import type { ConsentStatus } from "@/lib/derive";
import type { Contact } from "@/lib/types";

export function ContactActions({ contact, consent }: { contact: Contact; consent: ConsentStatus }) {
  const phone = normalizePhone(contact.phone);

  const canCall = consent.allowedChannels.includes("call") && phone;
  const canWhatsapp = consent.allowedChannels.includes("whatsapp") && phone;
  const canEmail = consent.allowedChannels.includes("email") && contact.email;

  return (
    <div className="flex flex-wrap gap-2">
      <ActionButton href={canCall ? `tel:+${phone!.e164Digits}` : undefined} disabled={!canCall} label="Llamar" />
      <ActionButton
        href={canWhatsapp ? `https://wa.me/${phone!.e164Digits}` : undefined}
        disabled={!canWhatsapp}
        label="WhatsApp"
        external
      />
      <ActionButton href={canEmail ? `mailto:${contact.email}` : undefined} disabled={!canEmail} label="Email" />
    </div>
  );
}

function ActionButton({ href, disabled, label, external }: { href?: string; disabled: boolean; label: string; external?: boolean }) {
  const base = "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors";
  if (disabled || !href) {
    return (
      <span className={`${base} cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600`} title="No disponible para este contacto">
        {label}
      </span>
    );
  }
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`${base} bg-indigo-600 text-white hover:bg-indigo-500`}
    >
      {label}
    </a>
  );
}
