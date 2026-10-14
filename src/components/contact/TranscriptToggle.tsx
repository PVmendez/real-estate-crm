"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

export function TranscriptToggle({ transcript }: { transcript: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className="mt-2">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-9 cursor-pointer items-center gap-1 text-sm font-medium text-accent-ink hover:underline hover:underline-offset-4"
      >
        <ChevronDown aria-hidden="true" className={`size-4 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
        {open ? "Ocultar transcripción" : "Ver transcripción"}
      </button>
      <pre
        id={id}
        hidden={!open}
        className="mt-1 rounded-md bg-sunken p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-ink"
      >
        {transcript}
      </pre>
    </div>
  );
}
