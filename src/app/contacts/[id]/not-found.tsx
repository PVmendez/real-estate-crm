import Link from "next/link";

export default function ContactNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-3 px-4 py-16 sm:px-6">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Contacto no encontrado</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Puede que el enlace sea antiguo o el contacto se haya eliminado.</p>
      <Link href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
        ← Volver al listado
      </Link>
    </div>
  );
}
