import { NextResponse } from "next/server";
import { getContacts } from "@/lib/contacts-repo";

export async function GET() {
  return NextResponse.json(await getContacts());
}
