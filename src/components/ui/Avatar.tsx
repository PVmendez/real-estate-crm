export function Avatar({ initials, isFallback, size = "md" }: { initials: string; isFallback: boolean; size?: "md" | "lg" }) {
  const sizeClasses = { md: "size-10 text-sm", lg: "size-14 text-lg" }[size];
  return (
    <div
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full font-serif font-medium ${sizeClasses} ${
        isFallback ? "border border-dashed border-line-strong text-ink-subtle" : "bg-accent-soft text-accent-ink"
      }`}
    >
      {initials}
    </div>
  );
}
