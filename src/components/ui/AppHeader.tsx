"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Contactos", match: (p: string) => p === "/" || p.startsWith("/contacts") },
  { href: "/inmuebles", label: "Inmuebles", match: (p: string) => p.startsWith("/inmuebles") },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 rounded-sm">
          <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-md bg-accent text-sm font-semibold text-on-accent">
            M
          </span>
          <span className="hidden text-[15px] font-semibold tracking-tight text-ink sm:inline">Miralvento</span>
        </Link>

        <nav aria-label="Principal" className="flex h-full items-stretch gap-1">
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center border-b-2 px-2.5 text-sm font-medium transition-colors duration-150 ${
                  active ? "border-accent text-ink" : "border-transparent text-ink-muted hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <div className="hidden text-right leading-tight sm:block">
            <p className="text-sm font-medium text-ink">Mario Ortega</p>
            <p className="text-xs text-ink-subtle">Agente comercial</p>
          </div>
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-ink"
          >
            MO
          </span>
          <span className="sr-only">Sesión iniciada como Mario Ortega</span>
        </div>
      </div>
    </header>
  );
}
