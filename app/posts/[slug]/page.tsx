import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logPageView } from "@/lib/analytics";
import { getPublicOrganization } from "@/lib/organization";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function getPost(slug: string) {
  const supabase = await createClient();
  const publicOrganization = await getPublicOrganization();
  let query = supabase.from("posts").select("*").eq("slug", slug).eq("status", "published").is("deleted_at", null);
  if (publicOrganization) query = query.eq("organization_id", publicOrganization.organization.id);
  const { data } = await query.maybeSingle();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  return post ? { title: post.title, description: post.ai_summary_review_status === "accepted" ? post.ai_summary : post.excerpt, openGraph: { title: post.title, description: post.excerpt ?? "", images: post.cover_image_url ? [post.cover_image_url] : [] } } : {};
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const publicOrganization = await getPublicOrganization();
  await logPageView(`/posts/${slug}`, publicOrganization?.organization.id);
  const post = await getPost(slug);
  if (!post) notFound();
  const supabase = await createClient();
  const { data: viewCount } = await supabase.rpc("post_view_count", { requested_path: `/posts/${slug}` });
  return <main><article className="article">
    <Link className="back" href="/">← All stories</Link>
    <p className="eyebrow">Journal</p>
    <h1>{post.title}</h1>
    <p className="meta">{post.published_at && new Date(post.published_at).toLocaleDateString("en-MY", { dateStyle: "long" })}</p>
    {post.cover_image_url && <Image className="article-cover" src={post.cover_image_url} width={1200} height={720} alt="" priority />}
    <div className="article-body">{post.body}</div>
    <p className="view-count">{viewCount ?? 0} views</p>
    {post.ai_tags_review_status === "accepted" && post.ai_tags?.length ? <div>{post.ai_tags.map((tag: string) => <span className="admin-link" key={tag}>{tag}</span>)}</div> : null}
  </article></main>;
}
