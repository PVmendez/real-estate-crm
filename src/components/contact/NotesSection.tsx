import { Section } from "@/components/ui/Section";

export function NotesSection({ notes }: { notes: string | null }) {
  if (!notes) return null;
  return (
    <Section id="notas" title="Notas">
      <p className="text-sm whitespace-pre-wrap text-ink">{notes}</p>
    </Section>
  );
}
