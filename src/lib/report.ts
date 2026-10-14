import type { Contact } from "./types";
import {
  detectDateFormat,
  formatDate,
  formatDateTime,
  normalizeChannel,
  normalizeEmail,
  normalizePhone,
  phoneRulesApplied,
  resolveDisplayName,
  toTitleCase,
} from "./normalize";
import { parseQualificationData } from "./qualification";

/**
 * Informe "antes y después": para cada campo, el valor tal como llegó del export, el valor que muestra
 * la ficha y las reglas que llevaron de uno a otro.
 *
 * - clean: ya venía bien; solo se presenta.
 * - normalized: se transformó con una regla determinista.
 * - inferred: se completó con una suposición (p. ej. prefijo de país o nombre derivado).
 * - invalid: el dato existe pero no es usable.
 * - missing: el dato no existe.
 */
export type FieldStatus = "clean" | "normalized" | "inferred" | "invalid" | "missing";

export type FieldKey = "name" | "phone" | "email" | "lead_source" | "created_at" | "qualification";

export interface NormalizationRow {
  field: FieldKey;
  label: string;
  raw: string | null;
  rawKind: "text" | "number" | "json" | "null";
  normalized: string | null;
  detail?: string;
  status: FieldStatus;
  rules: string[];
}

export interface NormalizationReport {
  rows: NormalizationRow[];
  fixedCount: number;
  issueCount: number;
}

const CANONICAL_CHANNEL_CODES = new Set([
  "VOICE_CALL",
  "VOICE",
  "WHATSAPP",
  "WEBSITE",
  "WEB_FORM",
  "META_LEAD_ADS",
  "EMAIL",
  "WITEI",
  "CRM",
]);

const PHONE_RULE_LABELS = {
  "strip-separators": "Se quitan espacios, guiones y paréntesis",
  "intl-00-prefix": "Prefijo internacional 00 → +",
  "assume-spain": "9 dígitos sin prefijo → se asume España (+34)",
} as const;

function nameRow(contact: Contact): NormalizationRow {
  const raw = contact.full_name;
  const base = { field: "name" as const, label: "Nombre", raw, rawKind: raw === null ? ("null" as const) : ("text" as const) };

  if (!raw || !raw.trim()) {
    const identity = resolveDisplayName(contact);
    const from = normalizePhone(contact.phone) ? "el teléfono normalizado" : contact.email ? "el email" : "el id interno";
    return {
      ...base,
      normalized: identity.name,
      status: "inferred",
      rules: [`Sin nombre: se identifica por ${from}`, "No cuenta como nombre real en la calidad del dato"],
    };
  }

  const normalized = toTitleCase(raw);
  const rules: string[] = [];
  if (raw === raw.toUpperCase() && raw !== raw.toLowerCase()) rules.push("TODO MAYÚSCULAS → nombre propio");
  else if (raw === raw.toLowerCase() && raw !== raw.toUpperCase()) rules.push("todo minúsculas → nombre propio");
  if (raw !== raw.trim()) rules.push("Se recortan espacios sobrantes");

  return normalized === raw
    ? { ...base, normalized, status: "clean", rules: ["Ya venía bien escrito"] }
    : { ...base, normalized, status: "normalized", rules };
}

function phoneRow(contact: Contact): NormalizationRow {
  const raw = contact.phone;
  const base = { field: "phone" as const, label: "Teléfono", raw, rawKind: raw === null ? ("null" as const) : ("text" as const) };

  if (!raw) {
    return { ...base, normalized: null, status: "missing", rules: ["Sin teléfono: llamada y WhatsApp quedan deshabilitados"] };
  }

  const phone = normalizePhone(raw);
  if (!phone) {
    return { ...base, normalized: null, status: "invalid", rules: ["No tiene dígitos suficientes para ser un teléfono"] };
  }

  const detail = `E.164: +${phone.e164Digits}`;
  if (phone.display === raw) {
    return { ...base, normalized: phone.display, detail, status: "clean", rules: ["Ya venía en formato canónico"] };
  }

  const applied = phoneRulesApplied(raw);
  const rules: string[] = applied.map((r) => PHONE_RULE_LABELS[r]);
  rules.push("Se agrupa para lectura: +34 6XX XX XX XX");
  return {
    ...base,
    normalized: phone.display,
    detail,
    status: applied.includes("assume-spain") ? "inferred" : "normalized",
    rules,
  };
}

function emailRow(contact: Contact): NormalizationRow {
  const raw = contact.email;
  const base = { field: "email" as const, label: "Email", raw, rawKind: raw === null ? ("null" as const) : ("text" as const) };
  const email = normalizeEmail(raw);

  if (!email) return { ...base, normalized: null, status: "missing", rules: ["Sin email: el canal email queda deshabilitado"] };

  if (!email.valid) {
    const why = raw!.includes("@@") ? "Doble @: formato inválido" : "No tiene forma de email (usuario@dominio.tld)";
    return { ...base, normalized: null, status: "invalid", rules: [why, "No se usa para contactar ni puntúa en calidad"] };
  }

  return email.value === raw
    ? { ...base, normalized: email.value, status: "clean", rules: ["Formato válido"] }
    : { ...base, normalized: email.value, status: "normalized", rules: ["Se pasa a minúsculas y se recortan espacios"] };
}

function leadSourceRow(contact: Contact): NormalizationRow {
  const raw = contact.lead_source;
  const base = { field: "lead_source" as const, label: "Origen", raw, rawKind: raw === null ? ("null" as const) : ("text" as const) };

  if (!raw) return { ...base, normalized: "Origen desconocido", status: "missing", rules: ["El export no indica el canal de entrada"] };

  const channel = normalizeChannel(raw);
  if (channel.label === "Origen desconocido") {
    return { ...base, normalized: channel.label, status: "invalid", rules: [`"${raw}" no corresponde a ningún canal conocido`] };
  }
  if (CANONICAL_CHANNEL_CODES.has(raw)) {
    return { ...base, normalized: channel.label, status: "clean", rules: ["Código del sistema → etiqueta legible"] };
  }
  return {
    ...base,
    normalized: channel.label,
    status: "normalized",
    rules: [`Alias "${raw}" unificado con el canal ${channel.label}`],
  };
}

const DATE_RULES = {
  iso: "ISO 8601 en UTC: se muestra en hora de Madrid",
  dmy: "dd/mm/aaaa: día primero (formato español), hora de Madrid",
  "dmy-time": "dd/mm/aaaa HH:mm: día primero, hora de Madrid",
  "epoch-s": "Timestamp Unix en segundos",
  "epoch-ms": "Timestamp Unix en milisegundos",
  unknown: "Formato no reconocido",
} as const;

function createdAtRow(contact: Contact): NormalizationRow {
  const raw = contact.created_at;
  const format = detectDateFormat(raw);
  const base = {
    field: "created_at" as const,
    label: "Fecha de alta",
    raw: raw === null || raw === undefined ? null : String(raw),
    rawKind: typeof raw === "number" ? ("number" as const) : ("text" as const),
  };

  if (format === "unknown") return { ...base, normalized: null, status: "invalid", rules: [DATE_RULES.unknown] };

  const hasTime = format === "iso" || format === "dmy-time";
  return {
    ...base,
    normalized: hasTime ? formatDateTime(raw) : formatDate(raw),
    status: format === "iso" ? "clean" : "normalized",
    rules: [DATE_RULES[format]],
  };
}

function qualificationRow(contact: Contact): NormalizationRow {
  const raw = contact.qualification_data;
  const base = { field: "qualification" as const, label: "Cualificación" };

  if (raw === null || raw === undefined) {
    return { ...base, raw: null, rawKind: "null", normalized: null, status: "missing", rules: ["Todavía no hay datos de cualificación"] };
  }

  const isString = typeof raw === "string";
  const rawText = isString ? raw : JSON.stringify(raw, null, 2);
  const { groups, parseError } = parseQualificationData(raw);

  if (parseError) {
    return { ...base, raw: rawText, rawKind: "text", normalized: null, status: "invalid", rules: ["Es un string que no es JSON válido"] };
  }

  const factCount = groups.reduce((n, g) => n + g.facts.length, 0);
  const rules: string[] = [];
  if (isString) rules.push("Llegó serializada como string JSON: se parsea");
  rules.push("Se aplana por operación (compra, alquiler, compartidos)");
  const block = (isString ? JSON.parse(raw) : raw) as Record<string, unknown>;
  const qualification = block.qualification as Record<string, unknown> | undefined;
  if (qualification && "_meta" in qualification) rules.push("Se descartan metadatos internos (_meta)");
  if (typeof block.net_income === "number") rules.push("Ingresos fuera del bloque → grupo Situación financiera");

  return {
    ...base,
    raw: rawText,
    rawKind: isString ? "text" : "json",
    normalized:
      factCount === 0
        ? "Sin datos útiles"
        : `${factCount} ${factCount === 1 ? "dato" : "datos"} en ${groups.map((g) => g.label).join(", ")}`,
    status: groups.length === 0 ? "missing" : "normalized",
    rules,
  };
}

export function buildNormalizationReport(contact: Contact): NormalizationReport {
  const rows = [nameRow, phoneRow, emailRow, leadSourceRow, createdAtRow, qualificationRow].map((build) => build(contact));
  return {
    rows,
    fixedCount: rows.filter((r) => r.status === "normalized" || r.status === "inferred").length,
    issueCount: rows.filter((r) => r.status === "invalid").length,
  };
}
