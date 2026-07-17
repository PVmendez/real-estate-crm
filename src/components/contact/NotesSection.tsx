export function NotesSection({ notes }: { notes: string | null }) {
  if (!notes) return null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Notas</h2>
      <p className="whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-300">{notes}</p>
    </div>
  );
}
