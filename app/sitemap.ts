import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data: posts } = await supabase.from("posts").select("slug,published_at").eq("status", "published").is("deleted_at", null);
  const staticRoutes = ["", "/gallery", "/videos", "/contact"].map((path) => ({ url: `${base}${path}`, lastModified: new Date() }));
  return [...staticRoutes, ...(posts ?? []).map((post) => ({ url: `${base}/posts/${post.slug}`, lastModified: post.published_at ? new Date(post.published_at) : new Date() }))];
}
