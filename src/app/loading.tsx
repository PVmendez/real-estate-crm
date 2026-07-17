export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl animate-pulse px-4 py-10 sm:px-6">
      <div className="mb-6 h-7 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-zinc-100 px-4 py-3.5 last:border-0 dark:border-zinc-800">
            <div className="h-11 w-11 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-56 rounded bg-zinc-100 dark:bg-zinc-800/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
