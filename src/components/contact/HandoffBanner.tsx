import type { Contact } from "@/lib/types";

export function HandoffBanner({ contact }: { contact: Contact }) {
  if (!contact.ai_handoff) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
      <span aria-hidden className="mt-0.5">
        🙋
      </span>
      <div>
        <p className="font-medium">Pidió hablar con una persona</p>
        {contact.handoff_reason && <p className="mt-0.5 text-amber-700/90 dark:text-amber-300/80">{contact.handoff_reason}</p>}
      </div>
    </div>
  );
}
