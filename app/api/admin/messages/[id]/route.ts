import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json();
  if (typeof body.is_read !== "boolean") return NextResponse.json({ error: "Invalid state." }, { status: 422 });
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const id = (await params).id;
  const { data: previous } = await supabase.from("contact_messages").select("*").eq("id", id).maybeSingle();
  const { data, error } = await supabase.from("contact_messages").update({ is_read: body.is_read, user_id: user.id }).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: "Message could not be updated." }, { status: 500 });
  await logAudit(supabase, { action: body.is_read ? "mark_read" : "mark_unread", table_name: "contact_messages", row_id: data.id, actor_user_id: user.id, old_value: previous, new_value: data });
  return NextResponse.json({ message: data });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const id = (await params).id;
  const { data: previous } = await supabase.from("contact_messages").select("*").eq("id", id).maybeSingle();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Message could not be removed." }, { status: 500 });
  await logAudit(supabase, { action: "delete", table_name: "contact_messages", row_id: id, actor_user_id: user.id, old_value: previous });
  return NextResponse.json({ ok: true });
}
