import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePostIntelligence } from "@/lib/ai";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json();
  const allowed = ["title", "body", "excerpt", "cover_image_url", "slug", "ai_summary", "ai_tags", "ai_summary_review_status", "ai_tags_review_status"];
  const update: Record<string, unknown> = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
  if (body.status === "draft" || body.status === "published") {
    update.status = body.status;
    update.published_at = body.status === "published" ? (body.published_at || new Date().toISOString()) : null;
  }
  const supabase = await createClient();
  const { data, error } = await supabase.from("posts").update(update).eq("id", (await params).id).select("*").single();
  if (error) return NextResponse.json({ error: "Post could not be updated." }, { status: 500 });

  const contentChanged = Object.prototype.hasOwnProperty.call(body, "body") || Object.prototype.hasOwnProperty.call(body, "title");
  if (!contentChanged) return NextResponse.json({ post: data });
  const intelligence = await generatePostIntelligence(data.title, data.body ?? "");
  if (!intelligence) return NextResponse.json({ post: data, ai_status: "unavailable" });
  const { data: enriched, error: aiSaveError } = await supabase.from("posts").update(intelligence).eq("id", data.id).select("*").single();
  if (aiSaveError) console.error("Post intelligence save failed", aiSaveError.code);
  return NextResponse.json({ post: enriched ?? data, ai_status: aiSaveError ? "save_failed" : "generated" });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").update({ deleted_at: new Date().toISOString() }).eq("id", (await params).id);
  if (error) return NextResponse.json({ error: "Post could not be removed." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
