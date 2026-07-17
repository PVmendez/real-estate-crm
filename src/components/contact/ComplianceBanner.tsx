import type { ConsentStatus } from "@/lib/derive";

export function ComplianceBanner({ consent }: { consent: ConsentStatus }) {
  if (!consent.blocked) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
      <span aria-hidden className="mt-0.5">
        ⛔
      </span>
      <div>
        <p className="font-medium">No contactar por los canales habituales</p>
        <p className="mt-0.5 text-rose-700/90 dark:text-rose-300/80">{consent.reason}</p>
        {consent.allowedChannels.length > 0 && (
          <p className="mt-1 text-xs text-rose-700/70 dark:text-rose-300/60">
            Canal permitido: {consent.allowedChannels.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
