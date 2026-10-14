import type { ReactNode } from "react";

/** Bloque de contenido de la ficha: título en serif, descripción opcional y acciones a la derecha. */
export function Section({
  title,
  description,
  aside,
  id,
  children,
}: {
  title: string;
  description?: ReactNode;
  aside?: ReactNode;
  id?: string;
  children: ReactNode;
}) {
  const headingId = id ? `${id}-titulo` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className="rounded-lg border border-line bg-surface">
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-line px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <h2 id={headingId} className="font-serif text-lg leading-tight font-medium text-ink">
            {title}
          </h2>
          {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
        </div>
        {aside}
      </header>
      <div className="px-4 py-4 sm:px-5">{children}</div>
    </section>
  );
}
