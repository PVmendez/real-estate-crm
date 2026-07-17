import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { normalizeChannel, normalizePhone, resolveDisplayName, formatDate } from "@/lib/normalize";
import { computeConsent } from "@/lib/derive";
import type { Contact } from "@/lib/types";
import { ContactActions } from "./ContactActions";

export function IdentityHeader({ contact }: { contact: Contact }) {
  const identity = resolveDisplayName(contact);
  const channel = normalizeChannel(contact.lead_source);
  const phone = normalizePhone(contact.phone);
  const consent = computeConsent(contact);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar initials={identity.initials} isFallback={identity.isFallback} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{identity.name}</h1>
              <Badge className={channel.colorClass}>{channel.label}</Badge>
            </div>
            {identity.isFallback && (
              <p className="mt-0.5 text-xs text-zinc-400">Sin nombre registrado — se muestra el mejor dato disponible</p>
            )}
            <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
              <div className="flex gap-1">
                <dt className="font-medium text-zinc-400 dark:text-zinc-500">Tel.</dt>
                <dd>{phone ? phone.display : "sin teléfono"}</dd>
              </div>
              <div className="flex gap-1">
                <dt className="font-medium text-zinc-400 dark:text-zinc-500">Email</dt>
                <dd>{contact.email ?? "sin email"}</dd>
              </div>
              <div className="flex gap-1">
                <dt className="font-medium text-zinc-400 dark:text-zinc-500">Alta</dt>
                <dd>{formatDate(contact.created_at)}</dd>
              </div>
            </dl>
          </div>
        </div>
        <ContactActions contact={contact} consent={consent} />
      </div>
    </div>
  );
}
