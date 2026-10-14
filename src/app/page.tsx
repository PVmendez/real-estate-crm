import { ContactsBrowser } from "@/components/contacts/ContactsBrowser";
import { getContacts } from "@/lib/contacts-repo";
import { isSortKey, isStatusFilter, toListItem } from "@/lib/contact-list";

export default async function ContactsListPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const contacts = await getContacts();
  // Los contactos marcados como prueba no se listan: solo existen para verificar integraciones.
  const items = contacts.filter((c) => !c.is_test).map(toListItem);
  const unassigned = contacts.filter((c) => !c.is_test && !c.assigned_agent_id).length;

  const q = typeof params.q === "string" ? params.q : "";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Contactos</h1>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Total" value={items.length} />
          <Stat label="Cualificados" value={items.filter((i) => i.status === "cualificado").length} />
          <Stat label="Piden hablar con una persona" value={items.filter((i) => i.needsHuman).length} tone="warn" />
          <Stat label="Sin agente asignado" value={unassigned} />
        </dl>
      </header>

      <ContactsBrowser
        items={items}
        initialQuery={q}
        initialStatus={isStatusFilter(params.estado) ? params.estado : "todos"}
        initialSort={isSortKey(params.orden) ? params.orden : "reciente"}
      />
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "warn" }) {
  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-3">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className={`mt-1 text-2xl font-semibold tabular-nums ${tone === "warn" && value > 0 ? "text-warn" : "text-ink"}`}>{value}</dd>
    </div>
  );
}
