import { Badge, type Tone } from "@/components/ui/Badge";
import { QUALIFICATION_STATUS_LABELS, type QualificationStatus } from "@/lib/qualification";

const TONES: Record<QualificationStatus, Tone> = {
  cualificado: "ok",
  parcial: "info",
  "sin-datos": "neutral",
  invalido: "danger",
};

export function StatusBadge({ status }: { status: QualificationStatus }) {
  return <Badge tone={TONES[status]}>{QUALIFICATION_STATUS_LABELS[status]}</Badge>;
}
