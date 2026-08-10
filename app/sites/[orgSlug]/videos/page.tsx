import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPublicOrganization } from "@/lib/organization";

export const dynamic = "force-dynamic";
export default async function TenantVideos({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params; const context = await getPublicOrganization(orgSlug);
  if (!context || !context.settings.videos_enabled) notFound();
  const supabase = await createClient(); const { data } = await supabase.from("videos").select("*").eq("organization_id", context.organization.id).is("deleted_at", null).order("created_at", { ascending: false });
  return <main className="tenant-site" data-theme={context.settings.theme}><a className="back" href={`/sites/${orgSlug}`}>← {context.organization.name}</a><h1>Videos</h1>{data?.length ? <section className="video-grid">{data.map(video => <article className="video-card" key={video.id}><iframe src={video.embed_url} title={video.title} allowFullScreen /><h2>{video.title}</h2><p>{video.description}</p></article>)}</section> : <div className="empty">No videos yet.</div>}</main>;
}
