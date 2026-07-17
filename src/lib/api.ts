import { headers } from "next/headers";
import type { Contact } from "./types";

async function baseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function fetchContacts(): Promise<Contact[]> {
  const res = await fetch(`${await baseUrl()}/api/contacts`, { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar el listado de contactos.");
  return res.json();
}

export async function fetchContact(id: string): Promise<Contact | null> {
  const res = await fetch(`${await baseUrl()}/api/contacts/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("No se pudo cargar el contacto.");
  return res.json();
}
