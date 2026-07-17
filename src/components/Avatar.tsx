export function Avatar({ initials, isFallback, size = "md" }: { initials: string; isFallback: boolean; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = { sm: "h-8 w-8 text-xs", md: "h-11 w-11 text-sm", lg: "h-14 w-14 text-base" }[size];
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${sizeClasses} ${
        isFallback
          ? "bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
          : "bg-indigo-600 text-white"
      }`}
      title={isFallback ? "Identidad sin confirmar — derivada de teléfono o email" : undefined}
    >
      {initials}
    </div>
  );
}
