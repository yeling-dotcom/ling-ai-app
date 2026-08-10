import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPublicOrganization } from "@/lib/organization";

export const dynamic = "force-dynamic";

export default async function TenantPost({ params }: { params: Promise<{ orgSlug: string; slug: string }> }) {
  const { orgSlug, slug } = await params;
  const context = await getPublicOrganization(orgSlug); if (!context) notFound();
  const supabase = await createClient();
  const { data: post } = await supabase.from("posts").select("*").eq("organization_id", context.organization.id).eq("slug", slug).eq("status", "published").is("deleted_at", null).maybeSingle();
  if (!post) notFound();
  return <main className="tenant-site" data-theme={context.settings.theme}><article className="article"><a className="back" href={`/sites/${orgSlug}`}>← {context.organization.name}</a><h1>{post.title}</h1><p className="meta">{post.published_at && new Date(post.published_at).toLocaleDateString()}</p><div className="article-body">{post.body}</div>{post.ai_tags_review_status === "accepted" && post.ai_tags?.length ? <div>{post.ai_tags.map((tag: string) => <span className="admin-link" key={tag}>{tag}</span>)}</div> : null}</article></main>;
}
