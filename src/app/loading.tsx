import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12" role="status" aria-live="polite">
      <span className="sr-only">Cargando contactos…</span>
      <div className="mb-8 max-w-2xl space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-full max-w-lg" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <Skeleton className="h-36 w-full rounded-lg" />
      <div className="mt-6 divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4 sm:px-5">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-64 max-w-full" />
            </div>
            <Skeleton className="hidden h-5 w-24 rounded-full sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
