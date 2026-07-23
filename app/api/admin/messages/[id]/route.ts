import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json();
  if (typeof body.is_read !== "boolean") return NextResponse.json({ error: "Invalid state." }, { status: 422 });
  const supabase = await createClient();
  const { data, error } = await supabase.from("contact_messages").update({ is_read: body.is_read }).eq("id", (await params).id).select("*").single();
  if (error) return NextResponse.json({ error: "Message could not be updated." }, { status: 500 });
  return NextResponse.json({ message: data });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").delete().eq("id", (await params).id);
  if (error) return NextResponse.json({ error: "Message could not be removed." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
