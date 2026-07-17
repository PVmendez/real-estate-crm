import type { Contact } from "./types";
import { normalizePhone, parseFlexibleDate, resolveDisplayName } from "./normalize";
import { parseQualificationData } from "./qualification";

export function lastInteractionAt(contact: Contact): Date | null {
  const dates = contact.interactions.map((i) => parseFlexibleDate(i.created_at)).filter((d): d is Date => d !== null);
  if (dates.length === 0) return null;
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

export interface HealthCheckItem {
  label: string;
  points: number;
  ok: boolean;
}

export interface HealthReport {
  score: number;
  items: HealthCheckItem[];
}

export function computeHealth(contact: Contact): HealthReport {
  const { isFallback } = resolveDisplayName(contact);
  const { groups } = parseQualificationData(contact.qualification_data);

  const items: HealthCheckItem[] = [
    { label: "Nombre real (no derivado de teléfono/email)", points: 15, ok: !isFallback },
    { label: "Teléfono normalizable", points: 15, ok: normalizePhone(contact.phone) !== null },
    { label: "Email", points: 10, ok: !!contact.email },
    { label: "Al menos un dato de cualificación", points: 30, ok: groups.length > 0 },
    { label: "Al menos una interacción registrada", points: 20, ok: contact.interactions.length > 0 },
    { label: "Agente asignado", points: 10, ok: !!contact.assigned_agent_id },
  ];

  const score = items.reduce((sum, item) => sum + (item.ok ? item.points : 0), 0);
  return { score, items };
}

export interface DuplicateMatch {
  contact: Contact;
  reason: "telefono" | "nombre";
}

function normalizeNameForMatch(name: string | null): string | null {
  if (!name) return null;
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function findDuplicates(all: Contact[], contact: Contact): DuplicateMatch[] {
  const phone = normalizePhone(contact.phone)?.e164Digits;
  const name = normalizeNameForMatch(contact.full_name);

  const matches: DuplicateMatch[] = [];
  for (const other of all) {
    if (other.id === contact.id || other.organization_id !== contact.organization_id) continue;

    const otherPhone = normalizePhone(other.phone)?.e164Digits;
    if (phone && otherPhone && phone === otherPhone) {
      matches.push({ contact: other, reason: "telefono" });
      continue;
    }

    const otherName = normalizeNameForMatch(other.full_name);
    if (name && otherName && name === otherName) {
      matches.push({ contact: other, reason: "nombre" });
    }
  }
  return matches;
}

export type ContactChannel = "call" | "whatsapp" | "email";

export interface ConsentStatus {
  blocked: boolean;
  allowedChannels: ContactChannel[];
  reason: string | null;
}

const NO_CONTACT_TAG = "no-llamar";

export function computeConsent(contact: Contact): ConsentStatus {
  const flagged = (contact.tags ?? []).some((t) => t.toLowerCase() === NO_CONTACT_TAG) || contact.matching_enabled === false;

  if (!flagged) {
    const allowed: ContactChannel[] = [];
    if (contact.phone) allowed.push("call", "whatsapp");
    if (contact.email) allowed.push("email");
    return { blocked: false, allowedChannels: allowed, reason: null };
  }

  const emailOnly = /solo.*email|email.*únicamente|unicamente.*email/i.test(contact.notes ?? "");
  return {
    blocked: true,
    allowedChannels: emailOnly && contact.email ? ["email"] : [],
    reason: contact.notes ?? "Este contacto ha pedido no ser contactado.",
  };
}

export function needsHumanHandoff(contact: Contact): boolean {
  return contact.ai_handoff === true;
}
