import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationForUser, planLimits } from "@/lib/organization";

export async function POST(request: Request) {
  const context = await getOrganizationForUser();
  if (!context) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (context.role !== "owner") return NextResponse.json({ error: "Only the owner can invite teammates." }, { status: 403 });
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const role = body.role === "reviewer" ? "reviewer" : "editor";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 422 });
  const supabase = await createClient();
  const { count } = await supabase.from("organization_members").select("*", { count: "exact", head: true }).eq("organization_id", context.organization.id);
  if ((count ?? 0) >= planLimits(context.organization.plan).members) return NextResponse.json({ error: "Your plan has no available member seats. Upgrade to Pro first." }, { status: 403 });
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("organization_invitations").insert({ organization_id: context.organization.id, email, role, invited_by: user!.id }).select("id,email,role,token,expires_at,accepted_at").single();
  if (error) return NextResponse.json({ error: "An active invitation may already exist for this email." }, { status: 409 });
  return NextResponse.json({ invitation: data }, { status: 201 });
}
