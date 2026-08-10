import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPublicOrganization } from "@/lib/organization";

export const dynamic = "force-dynamic";
export default async function TenantGallery({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params; const context = await getPublicOrganization(orgSlug);
  if (!context || !context.settings.gallery_enabled) notFound();
  const supabase = await createClient(); const { data } = await supabase.from("images").select("*").eq("organization_id", context.organization.id).is("deleted_at", null).order("created_at", { ascending: false });
  return <main className="tenant-site" data-theme={context.settings.theme}><a className="back" href={`/sites/${orgSlug}`}>← {context.organization.name}</a><h1>Gallery</h1>{data?.length ? <section className="gallery-grid">{data.map(image => <figure className="gallery-item" key={image.id}><Image src={image.url} width={800} height={600} alt={image.alt_text ?? ""} /><figcaption>{image.caption || image.alt_text}</figcaption></figure>)}</section> : <div className="empty">No images yet.</div>}</main>;
}
