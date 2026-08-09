import { NextResponse } from "next/server";
import { generatePostIntelligence } from "@/lib/ai";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json();
  const allowed = ["title", "body", "excerpt", "cover_image_url", "slug", "ai_summary", "ai_tags", "ai_summary_review_status", "ai_tags_review_status"];
  const update: Record<string, unknown> = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
  if (body.status === "draft" || body.status === "published") {
    update.status = body.status;
    update.published_at = body.status === "published" ? (body.published_at || new Date().toISOString()) : null;
  }
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const id = (await params).id;
  const { data: previous } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  update.user_id = user.id;
  const { data, error } = await supabase.from("posts").update(update).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: "Post could not be updated." }, { status: 500 });
  await logAudit(supabase, { action: data.status !== previous?.status ? `status:${data.status}` : "update", table_name: "posts", row_id: data.id, actor_user_id: user.id, old_value: previous, new_value: data });

  const contentChanged = Object.prototype.hasOwnProperty.call(body, "body") || Object.prototype.hasOwnProperty.call(body, "title");
  if (!contentChanged) return NextResponse.json({ post: data });
  const intelligence = await generatePostIntelligence(data.title, data.body ?? "");
  if (!intelligence) return NextResponse.json({ post: data, ai_status: "unavailable" });
  const { data: enriched, error: aiSaveError } = await supabase.from("posts").update(intelligence).eq("id", data.id).select("*").single();
  if (aiSaveError) console.error("Post intelligence save failed", aiSaveError.code);
  return NextResponse.json({ post: enriched ?? data, ai_status: aiSaveError ? "save_failed" : "generated" });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const id = (await params).id;
  const { data: previous } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  const next = { deleted_at: new Date().toISOString(), user_id: user.id };
  const { error } = await supabase.from("posts").update(next).eq("id", id);
  if (error) return NextResponse.json({ error: "Post could not be removed." }, { status: 500 });
  await logAudit(supabase, { action: "soft_delete", table_name: "posts", row_id: id, actor_user_id: user.id, old_value: previous, new_value: next });
  return NextResponse.json({ ok: true });
}
