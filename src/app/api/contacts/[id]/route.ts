import { NextResponse } from "next/server";
import contactsFile from "@/data/contactos.json";
import type { Contact } from "@/lib/types";
import { simulateLatency } from "@/lib/server-utils";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await simulateLatency();
  const { id } = await params;
  const contacts = contactsFile.contacts as unknown as Contact[];
  const contact = contacts.find((c) => c.id === id);

  if (!contact) {
    return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 });
  }
  return NextResponse.json(contact);
}
