import { Mail, MessageCircle, Phone } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import type { ConsentStatus } from "@/lib/derive";
import { normalizeEmail, normalizePhone } from "@/lib/normalize";
import type { Contact } from "@/lib/types";

export function ContactActions({ contact, consent }: { contact: Contact; consent: ConsentStatus }) {
  const phone = normalizePhone(contact.phone);
  const email = normalizeEmail(contact.email);

  const reason = (channel: "call" | "whatsapp" | "email", hasData: boolean, missing: string) =>
    !hasData ? missing : consent.allowedChannels.includes(channel) ? undefined : "el contacto pidió no ser contactado por aquí";

  const callReason = reason("call", !!phone, "no hay un teléfono válido");
  const whatsappReason = reason("whatsapp", !!phone, "no hay un teléfono válido");
  const emailReason = reason("email", !!email?.valid, email ? "el email tiene un formato inválido" : "no hay email");

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Contactar">
      <ButtonLink variant="primary" href={callReason ? undefined : `tel:+${phone!.e164Digits}`} disabledReason={callReason}>
        <Phone aria-hidden="true" className="size-4" />
        Llamar
      </ButtonLink>
      <ButtonLink
        href={whatsappReason ? undefined : `https://wa.me/${phone!.e164Digits}`}
        disabledReason={whatsappReason}
        external
      >
        <MessageCircle aria-hidden="true" className="size-4" />
        WhatsApp
      </ButtonLink>
      <ButtonLink href={emailReason ? undefined : `mailto:${email!.value}`} disabledReason={emailReason}>
        <Mail aria-hidden="true" className="size-4" />
        Email
      </ButtonLink>
    </div>
  );
}
