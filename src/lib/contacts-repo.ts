import { cache } from "react";
import contactsFile from "@/data/contactos.json";
import type { Contact } from "./types";
import { simulateLatency } from "./server-utils";

// Única puerta de acceso a los datos. La usan tanto los route handlers (/api/contacts) como las
// páginas, que la llaman directamente en vez de hacer fetch HTTP a su propia API: en Cloudflare
// Workers un Worker que se llama a sí mismo por su URL pública es frágil e innecesario.
const contacts = contactsFile.contacts as unknown as Contact[];

export async function getContacts(): Promise<Contact[]> {
  await simulateLatency();
  return contacts;
}

// cache(): la ficha y su <title> piden el mismo contacto en un mismo render; se resuelve una sola vez.
export const getContact = cache(async (id: string): Promise<Contact | null> => {
  await simulateLatency();
  return contacts.find((c) => c.id === id) ?? null;
});
