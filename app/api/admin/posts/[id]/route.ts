import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json();
  const allowed = ["title", "body", "excerpt", "cover_image_url", "slug", "ai_summary_review_status", "ai_tags_review_status"];
  const update: Record<string, unknown> = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
  if (body.status === "draft" || body.status === "published") {
    update.status = body.status;
    update.published_at = body.status === "published" ? (body.published_at || new Date().toISOString()) : null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase.from("posts").update(update).eq("id", (await params).id).select("*").single();
  if (error) return NextResponse.json({ error: "Post could not be updated." }, { status: 500 });
  return NextResponse.json({ post: data });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").update({ deleted_at: new Date().toISOString() }).eq("id", (await params).id);
  if (error) return NextResponse.json({ error: "Post could not be removed." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
