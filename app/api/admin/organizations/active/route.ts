import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const organizationId = String((await request.json()).organization_id ?? "");
  const { data } = await supabase.from("organization_members").select("organization_id").eq("organization_id", organizationId).eq("user_id", user.id).maybeSingle();
  if (!data) return NextResponse.json({ error: "Organization membership required." }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set("active_organization_id", organizationId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return response;
}
