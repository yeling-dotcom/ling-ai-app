import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "../admin-nav";
import { PostList } from "./post-list";

export const dynamic = "force-dynamic";

export default async function PostsAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("*").is("deleted_at", null).order("created_at", { ascending: false });
  return <main><div className="admin-shell"><AdminNav /><section><div className="admin-heading"><div><p className="eyebrow">Publishing desk</p><h2>Posts</h2></div><Link className="primary-button" href="/admin/posts/new">New post</Link></div><PostList initialPosts={data ?? []} /></section></div></main>;
}
