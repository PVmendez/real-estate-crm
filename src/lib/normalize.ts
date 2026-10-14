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


export type PhoneRule = "strip-separators" | "intl-00-prefix" | "assume-spain";

/** Qué transformaciones necesitó un teléfono crudo para llegar a su forma canónica. */
export function phoneRulesApplied(raw: string | null | undefined): PhoneRule[] {
  if (!raw) return [];
  const rules: PhoneRule[] = [];
  const compact = raw.replace(/[^\d+]/g, "");
  if (compact !== raw.trim()) rules.push("strip-separators");
  if (compact.startsWith("00")) rules.push("intl-00-prefix");
  else if (!compact.startsWith("+") && compact.length === 9) rules.push("assume-spain");
  return rules;
}

export interface NormalizedEmail {
  value: string;
  valid: boolean;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(raw: string | null | undefined): NormalizedEmail | null {
  if (!raw || !raw.trim()) return null;
  const value = raw.trim().toLowerCase();
  return { value, valid: EMAIL_PATTERN.test(value) };
}

export type DateFormat = "iso" | "dmy" | "dmy-time" | "epoch-s" | "epoch-ms" | "unknown";

const DMY_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?$/;

export function detectDateFormat(raw: string | number | null | undefined): DateFormat {
  if (raw === null || raw === undefined || raw === "") return "unknown";
  if (typeof raw === "number") return raw < 10_000_000_000 ? "epoch-s" : "epoch-ms";
  const dmy = raw.match(DMY_PATTERN);
  if (dmy) return dmy[4] ? "dmy-time" : "dmy";
  return isNaN(new Date(raw).getTime()) ? "unknown" : "iso";
}

export const BUSINESS_TIME_ZONE = "Europe/Madrid";

export function parseFlexibleDate(raw: string | number | null | undefined): Date | null {
  if (raw === null || raw === undefined || raw === "") return null;

  if (typeof raw === "number") {
    const ms = raw < 10_000_000_000 ? raw * 1000 : raw;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  const ddmmyyyy = raw.match(DMY_PATTERN);
  if (ddmmyyyy) {
    const [, dd, mm, yyyy, hh = "0", min = "0"] = ddmmyyyy;
    const d = madridWallTimeToDate(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min));
    return isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Las fechas "dd/mm/aaaa HH:mm" no traen zona: son hora de pared de la inmobiliaria (Madrid).
 * Se convierten a un instante real calculando el desfase de Europe/Madrid en esa fecha (CET/CEST),
 * así el resultado no depende de la zona horaria del servidor (UTC en Cloudflare Workers).
 */
function madridWallTimeToDate(year: number, month: number, day: number, hour: number, minute: number): Date {
  const asUtc = Date.UTC(year, month, day, hour, minute);
  const offset = madridOffsetMs(asUtc);
  const instant = asUtc - offset;
  // Segunda pasada por si el desfase cambia justo en un cambio de horario.
  return new Date(asUtc - madridOffsetMs(instant));
}

const madridParts = new Intl.DateTimeFormat("en-US", {
  timeZone: BUSINESS_TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function madridOffsetMs(utcMs: number): number {
  const parts = Object.fromEntries(madridParts.formatToParts(new Date(utcMs)).map((p) => [p.type, p.value]));
  const wall = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return wall - Math.floor(utcMs / 1000) * 1000;
}

export function formatDate(raw: string | number | null | undefined): string {
  const d = parseFlexibleDate(raw);
  if (!d) return "Fecha desconocida";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: BUSINESS_TIME_ZONE,
  }).format(d);
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
    timeZone: BUSINESS_TIME_ZONE,
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

export type ChannelKind = "call" | "whatsapp" | "web" | "ads" | "email" | "import" | "unknown";

export interface ChannelInfo {
  label: string;
  kind: ChannelKind;
}

const CHANNEL_MAP: Record<string, ChannelInfo> = {
  VOICE_CALL: { label: "Llamada", kind: "call" },
  VOICE: { label: "Llamada", kind: "call" },
  LLAMADA: { label: "Llamada", kind: "call" },
  VOZ: { label: "Llamada", kind: "call" },
  WHATSAPP: { label: "WhatsApp", kind: "whatsapp" },
  WEBSITE: { label: "Web", kind: "web" },
  WEB_FORM: { label: "Formulario web", kind: "web" },
  META_LEAD_ADS: { label: "Meta Ads", kind: "ads" },
  EMAIL: { label: "Email", kind: "email" },
  WITEI: { label: "Importado (Witei)", kind: "import" },
  CRM: { label: "Importado (CRM)", kind: "import" },
};

const FALLBACK_CHANNEL: ChannelInfo = { label: "Origen desconocido", kind: "unknown" };

export function normalizeChannel(raw: string | null | undefined): ChannelInfo {
  if (!raw) return FALLBACK_CHANNEL;
  return CHANNEL_MAP[raw.toUpperCase()] ?? FALLBACK_CHANNEL;
}
