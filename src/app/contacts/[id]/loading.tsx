export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl animate-pulse space-y-4 px-4 py-8 sm:px-6">
      <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="space-y-2">
            <div className="h-5 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-64 rounded bg-zinc-100 dark:bg-zinc-800/60" />
          </div>
        </div>
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="h-32 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900" />
      ))}
    </div>
  );
}
