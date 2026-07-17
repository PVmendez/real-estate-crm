"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-3 px-4 py-16 sm:px-6">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">No se pudo cargar la información</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{error.message || "Ha ocurrido un error inesperado."}</p>
      <button
        onClick={() => reset()}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
      >
        Reintentar
      </button>
    </div>
  );
}
