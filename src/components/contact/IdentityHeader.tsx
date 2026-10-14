import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ChannelBadge } from "@/components/ui/ChannelBadge";
import { StatusBadge } from "@/components/contacts/StatusBadge";
import type { ConsentStatus } from "@/lib/derive";
import { formatDate, normalizeChannel, normalizeEmail, normalizePhone, resolveDisplayName } from "@/lib/normalize";
import { qualificationStatus } from "@/lib/qualification";
import type { Contact } from "@/lib/types";
import { ContactActions } from "./ContactActions";

export function IdentityHeader({ contact, consent }: { contact: Contact; consent: ConsentStatus }) {
  const identity = resolveDisplayName(contact);
  const phone = normalizePhone(contact.phone);
  const email = normalizeEmail(contact.email);

  return (
    <header className="rounded-lg border border-line bg-surface p-4 sm:p-6">
      <div className="flex items-start gap-4">
        <Avatar initials={identity.initials} isFallback={identity.isFallback} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-2xl leading-tight font-medium tracking-tight break-words text-ink tabular-nums sm:text-3xl">
            {identity.name}
          </h1>
          {identity.isFallback && (
            <p className="mt-1 text-sm text-ink-muted">Sin nombre registrado: se identifica por el mejor dato disponible.</p>
          )}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <StatusBadge status={qualificationStatus(contact.qualification_data)} />
            <ChannelBadge {...normalizeChannel(contact.lead_source)} />
            {contact.is_test && <Badge>Contacto de prueba</Badge>}
          </div>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 border-t border-line pt-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Teléfono">
          {phone ? <span className="tabular-nums">{phone.display}</span> : <Empty>Sin teléfono</Empty>}
        </Field>
        <Field label="Email">
          {!email ? (
            <Empty>Sin email</Empty>
          ) : email.valid ? (
            <span className="break-all">{email.value}</span>
          ) : (
            <span className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-xs break-all text-ink-muted">{contact.email}</span>
              <Badge tone="danger">Inválido</Badge>
            </span>
          )}
        </Field>
        <Field label="Alta">{formatDate(contact.created_at)}</Field>
        <Field label="Agente asignado">{contact.assigned_agent_id ?? <Empty>Sin asignar</Empty>}</Field>
      </dl>

      <div className="mt-5 border-t border-line pt-5">
        <ContactActions contact={contact} consent={consent} />
      </div>
    </header>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-ink-subtle">{label}</dt>
      <dd className="mt-0.5 text-ink">{children}</dd>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <span className="text-ink-subtle">{children}</span>;
}
