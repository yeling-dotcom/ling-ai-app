import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  const body = await request.json();
  const url = String(body.url ?? "").trim();
  const alt_text = String(body.alt_text ?? "").trim();
  if (!/^https?:\/\//.test(url) || alt_text.length < 2) return NextResponse.json({ error: "A valid image URL and alt text are required." }, { status: 422 });
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { data, error } = await supabase.from("images").insert({ user_id: user.id, url, alt_text, caption: String(body.caption ?? "").trim() }).select("*").single();
  if (error) return NextResponse.json({ error: "Image could not be saved." }, { status: 500 });
  await logAudit(supabase, { action: "create", table_name: "images", row_id: data.id, actor_user_id: user.id, new_value: data });
  return NextResponse.json({ image: data }, { status: 201 });
}
