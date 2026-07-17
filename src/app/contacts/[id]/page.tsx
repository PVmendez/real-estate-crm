import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchContact, fetchContacts } from "@/lib/api";
import { computeConsent, computeHealth, findDuplicates } from "@/lib/derive";
import { IdentityHeader } from "@/components/contact/IdentityHeader";
import { HandoffBanner } from "@/components/contact/HandoffBanner";
import { ComplianceBanner } from "@/components/contact/ComplianceBanner";
import { DuplicateBanner } from "@/components/contact/DuplicateBanner";
import { HealthMeter } from "@/components/contact/HealthMeter";
import { NotesSection } from "@/components/contact/NotesSection";
import { QualificationSection } from "@/components/contact/QualificationSection";
import { Timeline } from "@/components/contact/Timeline";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = await fetchContact(id);
  if (!contact) notFound();

  const allContacts = await fetchContacts();
  const consent = computeConsent(contact);
  const health = computeHealth(contact);
  const duplicates = findDuplicates(allContacts, contact);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8 sm:px-6">
      <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
        ← Volver al listado
      </Link>

      <IdentityHeader contact={contact} />
      <HandoffBanner contact={contact} />
      <ComplianceBanner consent={consent} />
      <DuplicateBanner matches={duplicates} />
      <HealthMeter health={health} />
      <NotesSection notes={contact.notes} />
      <QualificationSection contact={contact} />
      <Timeline interactions={contact.interactions} />
    </div>
  );
}
