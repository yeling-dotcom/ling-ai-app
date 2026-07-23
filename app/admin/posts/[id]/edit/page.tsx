import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "../../../admin-nav";
import { PostForm } from "../../post-form";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("*").eq("id", (await params).id).is("deleted_at", null).maybeSingle();
  if (!data) notFound();
  return <main><div className="admin-shell"><AdminNav /><section><p className="eyebrow">Publishing desk</p><h2>Edit post</h2><PostForm post={data} /></section></div></main>;
}
