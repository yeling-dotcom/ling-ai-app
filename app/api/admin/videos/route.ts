import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { getOrganizationForUser } from "@/lib/organization";

export async function POST(request: Request) {
  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const embed_url = String(body.embed_url ?? "").trim();
  if (title.length < 2 || !/^https?:\/\//.test(embed_url)) return NextResponse.json({ error: "A title and valid embed URL are required." }, { status: 422 });
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const context = await getOrganizationForUser();
  if (!context) return NextResponse.json({ error: "Organization membership required." }, { status: 403 });
  const { data, error } = await supabase.from("videos").insert({ organization_id: context.organization.id, user_id: user.id, title, embed_url, description: String(body.description ?? "").trim(), thumbnail_url: String(body.thumbnail_url ?? "").trim() || null }).select("*").single();
  if (error) return NextResponse.json({ error: "Video could not be saved." }, { status: 500 });
  await logAudit(supabase, { action: "create", table_name: "videos", organization_id: context.organization.id, row_id: data.id, actor_user_id: user.id, new_value: data });
  return NextResponse.json({ video: data }, { status: 201 });
}
