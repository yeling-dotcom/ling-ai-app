import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getOrganizationForUser } from "@/lib/organization";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json();
  const update = Object.fromEntries(Object.entries(body).filter(([key]) => ["title", "embed_url", "description", "thumbnail_url"].includes(key)));
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const context = await getOrganizationForUser(); if (!context) return NextResponse.json({ error: "Organization membership required." }, { status: 403 });
  const id = (await params).id;
  const { data: previous } = await supabase.from("videos").select("*").eq("id", id).eq("organization_id", context.organization.id).maybeSingle();
  update.user_id = user.id;
  const { data, error } = await supabase.from("videos").update(update).eq("id", id).eq("organization_id", context.organization.id).select("*").single();
  if (error) return NextResponse.json({ error: "Video could not be updated." }, { status: 500 });
  await logAudit(supabase, { action: "update", table_name: "videos", organization_id: context.organization.id, row_id: data.id, actor_user_id: user.id, old_value: previous, new_value: data });
  return NextResponse.json({ video: data });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const context = await getOrganizationForUser(); if (!context) return NextResponse.json({ error: "Organization membership required." }, { status: 403 });
  const id = (await params).id;
  const { data: previous } = await supabase.from("videos").select("*").eq("id", id).eq("organization_id", context.organization.id).maybeSingle();
  const next = { deleted_at: new Date().toISOString(), user_id: user.id };
  const { error } = await supabase.from("videos").update(next).eq("id", id).eq("organization_id", context.organization.id);
  if (error) {
    console.error("Video soft delete failed", error.code, error.message);
    return NextResponse.json({ error: "Video could not be removed." }, { status: 500 });
  }
  await logAudit(supabase, { action: "soft_delete", table_name: "videos", organization_id: context.organization.id, row_id: id, actor_user_id: user.id, old_value: previous, new_value: next });
  return NextResponse.json({ ok: true });
}
