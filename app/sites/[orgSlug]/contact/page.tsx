import { notFound } from "next/navigation";
import { ContactForm } from "@/app/contact/contact-form";
import { getPublicOrganization } from "@/lib/organization";

export const dynamic = "force-dynamic";
export default async function TenantContact({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params; const context = await getPublicOrganization(orgSlug);
  if (!context || !context.settings.contact_enabled) notFound();
  return <main className="tenant-site" data-theme={context.settings.theme}><a className="back" href={`/sites/${orgSlug}`}>← {context.organization.name}</a><div className="contact-layout"><section><p className="eyebrow">Contact</p><h1>Send {context.organization.name} a message.</h1></section><ContactForm organizationSlug={orgSlug} /></div></main>;
}
