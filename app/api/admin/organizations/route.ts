import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const slug = String(body.slug ?? "").trim().toLowerCase();
  if (name.length < 2 || name.length > 80 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return NextResponse.json({ error: "Use a 2–80 character name and a lowercase URL slug." }, { status: 422 });
  const { data, error } = await supabase.rpc("create_organization", { organization_name: name, organization_slug: slug });
  if (error) return NextResponse.json({ error: "That slug may already be in use." }, { status: 409 });
  return NextResponse.json({ organization_id: data }, { status: 201 });
}
