"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useId, useMemo, useState } from "react";
import { ChevronRight, Search, SearchX, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChannelBadge } from "@/components/ui/ChannelBadge";
import { StateMessage } from "@/components/ui/StateMessage";
import { StatusBadge } from "./StatusBadge";
import { SORT_LABELS, filterAndSort, type ContactListItem, type SortKey, type StatusFilter } from "@/lib/contact-list";
import { QUALIFICATION_STATUS_LABELS, type QualificationStatus } from "@/lib/qualification";

const STATUS_ORDER: QualificationStatus[] = ["cualificado", "parcial", "sin-datos", "invalido"];

const dateFormat = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Madrid",
});

interface Props {
  items: ContactListItem[];
  initialQuery: string;
  initialStatus: StatusFilter;
  initialSort: SortKey;
}

export function ContactsBrowser({ items, initialQuery, initialStatus, initialSort }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState<StatusFilter>(initialStatus);
  const [sort, setSort] = useState<SortKey>(initialSort);
  const deferredQuery = useDeferredValue(query);
  const ids = useId();

  const counts = useMemo(() => {
    const byStatus = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0])) as Record<QualificationStatus, number>;
    for (const item of items) byStatus[item.status]++;
    return byStatus;
  }, [items]);

  const results = useMemo(
    () => filterAndSort(items, { query: deferredQuery, status, sort }),
    [items, deferredQuery, status, sort],
  );

  // El estado vive en la URL: se puede compartir, recargar y volver atrás sin perder el filtro.
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (status !== "todos") params.set("estado", status);
    if (sort !== "reciente") params.set("orden", sort);
    const search = params.toString();
    window.history.replaceState(null, "", search ? `?${search}` : window.location.pathname);
  }, [query, status, sort]);

  const filtersActive = query.trim() !== "" || status !== "todos";
  const clearFilters = () => {
    setQuery("");
    setStatus("todos");
  };

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor={`${ids}-q`} className="mb-1.5 block text-sm font-medium text-ink">
              Buscar
            </label>
            <div className="relative">
              <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-subtle" />
              <input
                id={`${ids}-q`}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nombre, email o teléfono"
                autoComplete="off"
                aria-describedby={`${ids}-q-hint`}
                className="h-11 w-full rounded-md border border-line-strong bg-surface pr-10 pl-9 text-base text-ink placeholder:text-ink-subtle sm:text-sm [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-ink-subtle hover:text-ink"
                >
                  <X aria-hidden="true" className="size-4" />
                  <span className="sr-only">Borrar búsqueda</span>
                </button>
              )}
            </div>
            <p id={`${ids}-q-hint`} className="sr-only">
              Los teléfonos se comparan ya normalizados: 655 12 34, 0034655 o +34-655 encuentran el mismo número.
            </p>
          </div>

          <div className="sm:w-56">
            <label htmlFor={`${ids}-sort`} className="mb-1.5 block text-sm font-medium text-ink">
              Ordenar por
            </label>
            <select
              id={`${ids}-sort`}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-11 w-full cursor-pointer rounded-md border border-line-strong bg-surface px-3 text-base text-ink sm:text-sm"
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                <option key={key} value={key}>
                  {SORT_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-ink">Estado de cualificación</legend>
          <div className="flex flex-wrap gap-2">
            {(["todos", ...STATUS_ORDER] as StatusFilter[]).map((value) => {
              const count = value === "todos" ? items.length : counts[value];
              const label = value === "todos" ? "Todos" : QUALIFICATION_STATUS_LABELS[value];
              return (
                <label
                  key={value}
                  className="relative inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-line-strong px-3.5 text-sm text-ink-muted transition-colors duration-150 hover:text-ink has-checked:border-accent has-checked:bg-accent has-checked:text-on-accent has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
                >
                  <input
                    type="radio"
                    name={`${ids}-estado`}
                    value={value}
                    checked={status === value}
                    onChange={() => setStatus(value)}
                    className="sr-only"
                  />
                  {label}
                  <span className="font-mono text-xs tabular-nums opacity-80">{count}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      <div className="mt-6 mb-3 flex items-center justify-between gap-4">
        <p role="status" aria-live="polite" className="text-sm text-ink-muted">
          {results.length === items.length
            ? `${items.length} contactos`
            : `${results.length} de ${items.length} contactos`}
        </p>
        {filtersActive && results.length > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="cursor-pointer text-sm font-medium text-accent-ink underline-offset-4 hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface">
          <StateMessage
            icon={<SearchX className="size-5" />}
            title="Ningún contacto coincide"
            action={
              <Button type="button" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            }
          >
            {query.trim()
              ? `No hay contactos que coincidan con «${query.trim()}» con el estado elegido.`
              : "No hay contactos con este estado de cualificación."}
          </StateMessage>
        </div>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
          {results.map((item) => (
            <li key={item.id}>
              <ContactRow item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ContactRow({ item }: { item: ContactListItem }) {
  const secondary = item.isFallbackName
    ? ["Sin nombre registrado", item.email].filter(Boolean).join(" · ")
    : [item.phone, item.email].filter(Boolean).join(" · ") || "Sin datos de contacto";

  return (
    <Link
      href={`/contacts/${item.id}`}
      className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2 px-4 py-3.5 transition-colors duration-150 hover:bg-paper focus-visible:-outline-offset-2 sm:grid-cols-[auto_minmax(0,1fr)_8.5rem_9rem_auto] sm:gap-x-5 sm:px-5"
    >
      <Avatar initials={item.initials} isFallback={item.isFallbackName} />

      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <p className={`truncate font-medium tabular-nums ${item.isFallbackName ? "text-ink-muted" : "text-ink"}`}>
            {item.name}
          </p>
          {item.needsHuman && <Badge tone="warn">Pide un humano</Badge>}
          {item.doNotContact && <Badge tone="danger">No contactar</Badge>}
          {item.isTest && <Badge>Prueba</Badge>}
        </div>
        <p className="mt-0.5 truncate text-sm text-ink-muted">{secondary}</p>
      </div>

      <ChevronRight aria-hidden="true" className="size-4 text-ink-subtle transition-transform duration-150 group-hover:translate-x-0.5 sm:order-last" />

      <div className="col-span-3 col-start-1 flex flex-wrap items-center gap-2 pl-13 sm:col-span-1 sm:col-start-auto sm:block sm:pl-0">
        <StatusBadge status={item.status} />
        <span className="text-xs text-ink-subtle sm:mt-1 sm:block">
          <ChannelBadge {...item.channel} />
        </span>
      </div>

      <p className="col-span-3 col-start-1 hidden text-sm text-ink-muted sm:col-span-1 sm:col-start-auto sm:block">
        <LastInteraction at={item.lastInteractionAt} />
      </p>
    </Link>
  );
}

function LastInteraction({ at }: { at: number | null }) {
  if (at === null) return <span className="text-ink-subtle">Sin interacciones</span>;
  return (
    <>
      <span className="block text-xs text-ink-subtle">Última interacción</span>
      <time dateTime={new Date(at).toISOString()}>{dateFormat.format(at)}</time>
    </>
  );
}
