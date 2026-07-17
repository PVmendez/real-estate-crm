import Link from "next/link";
import { fetchContacts } from "@/lib/api";
import { normalizeChannel, resolveDisplayName, formatDateTime } from "@/lib/normalize";
import { lastInteractionAt, computeConsent } from "@/lib/derive";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";

export default async function ContactsListPage() {
  const contacts = await fetchContacts();

  const sorted = [...contacts].sort((a, b) => {
    const da = lastInteractionAt(a)?.getTime() ?? 0;
    const db = lastInteractionAt(b)?.getTime() ?? 0;
    return db - da;
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Contactos</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {contacts.length} contactos · ordenados por última interacción
        </p>
      </header>

      <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
        {sorted.map((contact) => {
          const identity = resolveDisplayName(contact);
          const channel = normalizeChannel(contact.lead_source);
          const last = lastInteractionAt(contact);
          const consent = computeConsent(contact);

          return (
            <li key={contact.id}>
              <Link
                href={`/contacts/${contact.id}`}
                className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
              >
                <Avatar initials={identity.initials} isFallback={identity.isFallback} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">{identity.name}</p>
                    {contact.is_test && (
                      <Badge className="bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">test</Badge>
                    )}
                    {consent.blocked && (
                      <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">no contactar</Badge>
                    )}
                    {contact.ai_handoff && (
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                        necesita humano
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-zinc-500 dark:text-zinc-400">
                    {last ? `Última interacción: ${formatDateTime(last.toISOString())}` : "Sin interacciones registradas"}
                  </p>
                </div>
                <Badge className={channel.colorClass}>{channel.label}</Badge>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
