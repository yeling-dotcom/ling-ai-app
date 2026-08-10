import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPublicOrganization } from "@/lib/organization";

export const dynamic = "force-dynamic";

export default async function TenantHome({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const context = await getPublicOrganization(orgSlug);
  if (!context) notFound();
  const supabase = await createClient();
  const { data: posts } = await supabase.from("posts").select("id,title,slug,excerpt,published_at").eq("organization_id", context.organization.id).eq("status", "published").is("deleted_at", null).order("published_at", { ascending: false });
  return <main className="tenant-site" data-theme={context.settings.theme}><section className="hero"><p className="eyebrow">Independent publication</p><h1>{context.organization.name}</h1><nav className="admin-actions"><Link href={`/sites/${orgSlug}`}>Posts</Link>{context.settings.gallery_enabled && <Link href={`/sites/${orgSlug}/gallery`}>Gallery</Link>}{context.settings.videos_enabled && <Link href={`/sites/${orgSlug}/videos`}>Videos</Link>}{context.settings.contact_enabled && <Link href={`/sites/${orgSlug}/contact`}>Contact</Link>}</nav></section>{posts?.length ? <section className="post-grid">{posts.map(post => <Link className="post-card" href={`/sites/${orgSlug}/posts/${post.slug}`} key={post.id}><div className="post-copy"><span className="meta">{post.published_at ? new Date(post.published_at).toLocaleDateString() : "New"}</span><h2>{post.title}</h2><p>{post.excerpt}</p></div></Link>)}</section> : <div className="empty">No published posts yet.</div>}</main>;
}
