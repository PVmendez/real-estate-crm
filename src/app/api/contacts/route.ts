import { NextResponse } from "next/server";
import contactsFile from "@/data/contactos.json";
import type { Contact } from "@/lib/types";
import { simulateLatency } from "@/lib/server-utils";

export async function GET() {
  await simulateLatency();
  const contacts = contactsFile.contacts as unknown as Contact[];
  return NextResponse.json(contacts);
}
