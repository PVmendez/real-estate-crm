import { ContactsBrowser } from "@/components/contacts/ContactsBrowser";
import { getContacts } from "@/lib/contacts-repo";
import { isSortKey, isStatusFilter, toListItem } from "@/lib/contact-list";

export default async function ContactsListPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const contacts = await getContacts();
  const items = contacts.map(toListItem);

  const fixed = items.reduce((n, i) => n + i.fixedCount, 0);
  const issues = items.reduce((n, i) => n + i.issueCount, 0);
  const q = typeof params.q === "string" ? params.q : "";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 max-w-2xl">
        <p className="font-mono text-xs font-medium tracking-[0.14em] text-accent-ink uppercase">Contactos</p>
        <h1 className="mt-2 font-serif text-3xl leading-tight font-medium tracking-tight text-balance text-ink sm:text-4xl">
          {items.length} contactos de seis canales distintos, en una sola forma
        </h1>
        <p className="mt-3 text-base text-pretty text-ink-muted">
          Llamadas con IA, WhatsApp, formularios, campañas e importaciones llegan con teléfonos, fechas y nombres en
          formatos incompatibles. Cada ficha muestra el dato limpio y, al lado, cómo venía.
        </p>
        <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
          <Stat label="Campos corregidos" value={fixed} />
          <Stat label="Datos inválidos detectados" value={issues} />
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs text-ink-subtle">{label}</dt>
      <dd className="font-serif text-2xl font-medium tabular-nums text-ink">{value}</dd>
    </div>
  );
}
