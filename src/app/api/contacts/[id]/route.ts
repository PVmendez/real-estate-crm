import { NextResponse } from "next/server";
import { getContact } from "@/lib/contacts-repo";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = await getContact(id);

  if (!contact) {
    return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 });
  }
  return NextResponse.json(contact);
}
