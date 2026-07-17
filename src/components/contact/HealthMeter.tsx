import type { HealthReport } from "@/lib/derive";

export function HealthMeter({ health }: { health: HealthReport }) {
  const missing = health.items.filter((i) => !i.ok);
  const color = health.score >= 80 ? "bg-emerald-500" : health.score >= 50 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Completitud de la ficha</p>
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{health.score}%</p>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div className={`h-full ${color}`} style={{ width: `${health.score}%` }} />
      </div>
      {missing.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
          {missing.map((item) => (
            <li key={item.label}>· Falta: {item.label}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
