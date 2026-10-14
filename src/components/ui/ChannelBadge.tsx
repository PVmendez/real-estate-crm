import { Archive, CircleHelp, Globe, Mail, Megaphone, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import type { ChannelKind } from "@/lib/normalize";
import { Badge } from "./Badge";

const ICONS: Record<ChannelKind, LucideIcon> = {
  call: Phone,
  whatsapp: MessageCircle,
  web: Globe,
  ads: Megaphone,
  email: Mail,
  import: Archive,
  unknown: CircleHelp,
};

export function ChannelBadge({ kind, label }: { kind: ChannelKind; label: string }) {
  const Icon = ICONS[kind];
  return (
    <Badge tone={kind === "unknown" ? "warn" : "neutral"} icon={<Icon aria-hidden="true" className="size-3" strokeWidth={2.25} />}>
      {label}
    </Badge>
  );
}
