"use client";

import { useState } from "react";

export function TranscriptToggle({ transcript }: { transcript: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
      >
        {open ? "Ocultar transcripción" : "Ver transcripción"}
      </button>
      {open && (
        <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-zinc-50 p-3 font-sans text-xs text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300">
          {transcript}
        </pre>
      )}
    </div>
  );
}
