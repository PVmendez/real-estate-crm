import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getContact, getContacts } from "@/lib/contacts-repo";
import { computeConsent, computeHealth, findDuplicates } from "@/lib/derive";
import { resolveDisplayName } from "@/lib/normalize";
import { ContactAlerts } from "@/components/contact/ContactAlerts";
import { DataQuality } from "@/components/contact/DataQuality";
import { IdentityHeader } from "@/components/contact/IdentityHeader";
import { NotesSection } from "@/components/contact/NotesSection";
import { QualificationSection } from "@/components/contact/QualificationSection";
import { Timeline } from "@/components/contact/Timeline";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const contact = await getContact((await params).id);
  return { title: contact ? resolveDisplayName(contact).name : "Contacto no encontrado" };
}

export default async function ContactDetailPage({ params }: Props) {
  const { id } = await params;
  const [contact, allContacts] = await Promise.all([getContact(id), getContacts()]);
  if (!contact) notFound();

  const consent = computeConsent(contact);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <BackLink />

      <div className="mt-4 space-y-4">
        <IdentityHeader contact={contact} consent={consent} />
        <ContactAlerts contact={contact} consent={consent} duplicates={findDuplicates(allContacts, contact)} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 space-y-4">
          <QualificationSection contact={contact} />
          <Timeline interactions={contact.interactions} />
        </div>
        <aside className="space-y-4" aria-label="Resumen de la ficha">
          <DataQuality health={computeHealth(contact)} />
          <NotesSection notes={contact.notes} />
        </aside>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/"
      className="inline-flex min-h-11 items-center gap-1.5 rounded-sm text-sm font-medium text-ink-muted hover:text-ink"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      Contactos
    </Link>
  );
}
