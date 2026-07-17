export interface NormalizedPhone {
  e164Digits: string;
  display: string;
}

export function normalizePhone(raw: string | null | undefined): NormalizedPhone | null {
  if (!raw) return null;
  let digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("00")) digits = "+" + digits.slice(2);
  if (!digits.startsWith("+")) {
    digits = digits.length === 9 ? "+34" + digits : "+" + digits;
  }
  const plainDigits = digits.slice(1);
  if (plainDigits.length < 9) return null;

  const country = plainDigits.startsWith("34") ? plainDigits.slice(0, 2) : plainDigits.slice(0, plainDigits.length - 9);
  const rest = plainDigits.slice(country.length);
  const grouped = rest.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4");

  return {
    e164Digits: plainDigits,
    display: `+${country} ${grouped || rest}`,
  };
}


export function parseFlexibleDate(raw: string | number | null | undefined): Date | null {
  if (raw === null || raw === undefined || raw === "") return null;

  if (typeof raw === "number") {
    const ms = raw < 10_000_000_000 ? raw * 1000 : raw;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  const ddmmyyyy = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?$/);
  if (ddmmyyyy) {
    const [, dd, mm, yyyy, hh = "0", min = "0"] = ddmmyyyy;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min));
    return isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

export function formatDate(raw: string | number | null | undefined): string {
  const d = parseFlexibleDate(raw);
  if (!d) return "Fecha desconocida";
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

export function formatDateTime(raw: string | number | null | undefined): string {
  const d = parseFlexibleDate(raw);
  if (!d) return "Fecha desconocida";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function toTitleCase(name: string): string {
  if (name !== name.toUpperCase() && name !== name.toLowerCase()) return name.trim();
  return name
    .toLowerCase()
    .split(/(\s+)/)
    .map((part) => (part.trim() ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join("")
    .trim();
}

export interface DisplayIdentity {
  name: string;
  isFallback: boolean;
  initials: string;
}

export function resolveDisplayName(contact: {
  full_name: string | null;
  phone: string | null;
  email: string | null;
  id: string;
}): DisplayIdentity {
  if (contact.full_name && contact.full_name.trim()) {
    const name = toTitleCase(contact.full_name);
    return { name, isFallback: false, initials: initialsFrom(name) };
  }
  const phone = normalizePhone(contact.phone);
  if (phone) return { name: phone.display, isFallback: true, initials: "#" };
  if (contact.email) return { name: contact.email, isFallback: true, initials: contact.email[0]?.toUpperCase() ?? "?" };
  return { name: `Contacto ${contact.id}`, isFallback: true, initials: "?" };
}

function initialsFrom(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export interface ChannelInfo {
  label: string;
  colorClass: string;
}

const CHANNEL_MAP: Record<string, ChannelInfo> = {
  VOICE_CALL: { label: "Llamada", colorClass: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" },
  VOICE: { label: "Llamada", colorClass: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" },
  LLAMADA: { label: "Llamada", colorClass: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" },
  VOZ: { label: "Llamada", colorClass: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" },
  WHATSAPP: { label: "WhatsApp", colorClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  WEBSITE: { label: "Web", colorClass: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" },
  WEB_FORM: { label: "Formulario web", colorClass: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" },
  META_LEAD_ADS: { label: "Meta Ads", colorClass: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  EMAIL: { label: "Email", colorClass: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  WITEI: { label: "Importado (Witei)", colorClass: "bg-zinc-200 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300" },
  CRM: { label: "Importado (CRM)", colorClass: "bg-zinc-200 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300" },
};

const FALLBACK_CHANNEL: ChannelInfo = {
  label: "Origen desconocido",
  colorClass: "bg-zinc-200 text-zinc-600 dark:bg-zinc-500/15 dark:text-zinc-400",
};

export function normalizeChannel(raw: string | null | undefined): ChannelInfo {
  if (!raw) return FALLBACK_CHANNEL;
  return CHANNEL_MAP[raw.toUpperCase()] ?? FALLBACK_CHANNEL;
}
