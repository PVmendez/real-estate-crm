import type { Contact } from "./types";
import type { ChannelInfo } from "./normalize";
import { normalizeChannel, normalizeEmail, normalizePhone, parseFlexibleDate, resolveDisplayName } from "./normalize";
import { computeConsent, computeHealth, lastInteractionAt } from "./derive";
import { qualificationStatus, type QualificationStatus } from "./qualification";
import { buildNormalizationReport } from "./report";

/** Fila del listado ya normalizada y serializable, lista para filtrar y ordenar en el cliente. */
export interface ContactListItem {
  id: string;
  name: string;
  isFallbackName: boolean;
  initials: string;
  phone: string | null;
  phoneDigits: string | null;
  email: string | null;
  channel: ChannelInfo;
  status: QualificationStatus;
  health: number;
  fixedCount: number;
  issueCount: number;
  lastInteractionAt: number | null;
  createdAt: number | null;
  isTest: boolean;
  doNotContact: boolean;
  needsHuman: boolean;
}

export function toListItem(contact: Contact): ContactListItem {
  const identity = resolveDisplayName(contact);
  const phone = normalizePhone(contact.phone);
  const email = normalizeEmail(contact.email);
  const report = buildNormalizationReport(contact);

  return {
    id: contact.id,
    name: identity.name,
    isFallbackName: identity.isFallback,
    initials: identity.initials,
    phone: phone?.display ?? null,
    phoneDigits: phone?.e164Digits ?? null,
    email: email?.valid ? email.value : null,
    channel: normalizeChannel(contact.lead_source),
    status: qualificationStatus(contact.qualification_data),
    health: computeHealth(contact).score,
    fixedCount: report.fixedCount,
    issueCount: report.issueCount,
    lastInteractionAt: lastInteractionAt(contact)?.getTime() ?? null,
    createdAt: parseFlexibleDate(contact.created_at)?.getTime() ?? null,
    isTest: contact.is_test,
    doNotContact: computeConsent(contact).blocked,
    needsHuman: contact.ai_handoff,
  };
}

export type SortKey = "reciente" | "nombre" | "alta" | "calidad";
export type StatusFilter = QualificationStatus | "todos";

export const SORT_LABELS: Record<SortKey, string> = {
  reciente: "Última interacción",
  nombre: "Nombre (A–Z)",
  alta: "Fecha de alta",
  calidad: "Calidad del dato",
};

export function isSortKey(value: unknown): value is SortKey {
  return typeof value === "string" && value in SORT_LABELS;
}

export function isStatusFilter(value: unknown): value is StatusFilter {
  return value === "todos" || value === "cualificado" || value === "parcial" || value === "sin-datos" || value === "invalido";
}

function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * Busca por nombre, email o teléfono. Si la consulta tiene dígitos, se compara contra el teléfono ya
 * normalizado: "655 12 34", "0034655" o "+34-655" encuentran el mismo contacto escrito de formas distintas.
 */
export function matchesQuery(item: ContactListItem, query: string): boolean {
  const q = fold(query.trim());
  if (!q) return true;
  if (fold(item.name).includes(q) || (item.email && item.email.includes(q))) return true;

  let digits = q.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length < 3 || /[a-z]/.test(q) || !item.phoneDigits) return false;
  return item.phoneDigits.includes(digits);
}

const byName = (a: ContactListItem, b: ContactListItem) => a.name.localeCompare(b.name, "es");
const desc = (a: number | null, b: number | null) => (b ?? -Infinity) - (a ?? -Infinity);

export function sortItems(items: ContactListItem[], sort: SortKey): ContactListItem[] {
  const sorted = [...items];
  switch (sort) {
    case "nombre":
      // Los contactos sin nombre real (identificados por teléfono) van al final.
      return sorted.sort((a, b) => Number(a.isFallbackName) - Number(b.isFallbackName) || byName(a, b));
    case "alta":
      return sorted.sort((a, b) => desc(a.createdAt, b.createdAt) || byName(a, b));
    case "calidad":
      return sorted.sort((a, b) => b.health - a.health || byName(a, b));
    case "reciente":
      return sorted.sort((a, b) => desc(a.lastInteractionAt, b.lastInteractionAt) || desc(a.createdAt, b.createdAt));
  }
}

export function filterAndSort(items: ContactListItem[], { query, status, sort }: { query: string; status: StatusFilter; sort: SortKey }) {
  return sortItems(
    items.filter((item) => (status === "todos" || item.status === status) && matchesQuery(item, query)),
    sort,
  );
}
