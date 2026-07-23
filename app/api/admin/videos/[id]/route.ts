import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json();
  const update = Object.fromEntries(Object.entries(body).filter(([key]) => ["title", "embed_url", "description", "thumbnail_url"].includes(key)));
  const supabase = await createClient();
  const { data, error } = await supabase.from("videos").update(update).eq("id", (await params).id).select("*").single();
  if (error) return NextResponse.json({ error: "Video could not be updated." }, { status: 500 });
  return NextResponse.json({ video: data });
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { error } = await supabase.from("videos").update({ deleted_at: new Date().toISOString() }).eq("id", (await params).id);
  if (error) return NextResponse.json({ error: "Video could not be removed." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
