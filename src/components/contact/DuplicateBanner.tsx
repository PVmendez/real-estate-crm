import Link from "next/link";
import type { DuplicateMatch } from "@/lib/derive";
import { resolveDisplayName } from "@/lib/normalize";

export function DuplicateBanner({ matches }: { matches: DuplicateMatch[] }) {
  if (matches.length === 0) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300">
      <span aria-hidden className="mt-0.5">
        🧬
      </span>
      <div>
        <p className="font-medium">Posible contacto duplicado</p>
        <ul className="mt-1 space-y-0.5">
          {matches.map(({ contact, reason }) => (
            <li key={contact.id}>
              <Link href={`/contacts/${contact.id}`} className="underline underline-offset-2 hover:text-sky-900 dark:hover:text-sky-200">
                {resolveDisplayName(contact).name}
              </Link>{" "}
              <span className="text-sky-700/70 dark:text-sky-300/60">
                — mismo {reason === "telefono" ? "teléfono" : "nombre"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
