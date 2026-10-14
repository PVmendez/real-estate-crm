import contactsFile from "@/data/contactos.json";
import type { Contact } from "@/lib/types";

export const allContacts = contactsFile.contacts as unknown as Contact[];

export function contactById(id: string): Contact {
  const contact = allContacts.find((c) => c.id === id);
  if (!contact) throw new Error(`Fixture ${id} no existe en el dataset`);
  return structuredClone(contact);
}

export function makeContact(overrides: Partial<Contact> = {}): Contact {
  return {
    id: "c-test",
    organization_id: "ORG-TEST",
    full_name: "Ana Pérez",
    phone: "+34 600 11 22 33",
    email: "ana@example.com",
    lead_source: "WHATSAPP",
    contact_type: null,
    created_at: "2026-07-01T10:00:00Z",
    ai_handoff: false,
    is_test: false,
    assigned_agent_id: null,
    matching_enabled: true,
    tags: null,
    notes: null,
    qualification_data: null,
    interest_preferences: null,
    interactions: [],
    ...overrides,
  };
}
