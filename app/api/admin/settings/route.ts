import { NextResponse } from "next/server";
import { getOrganizationForUser, planLimits } from "@/lib/organization";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  const context = await getOrganizationForUser();
  if (!context) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (context.role !== "owner") return NextResponse.json({ error: "Only the organization owner can change settings." }, { status: 403 });
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const theme = String(body.theme ?? "editorial");
  const limits = planLimits(context.organization.plan);
  if (name.length < 2 || name.length > 80) return NextResponse.json({ error: "Organization name must be 2–80 characters." }, { status: 422 });
  if (!(limits.themes as readonly string[]).includes(theme)) return NextResponse.json({ error: "Upgrade to Pro to use that theme." }, { status: 403 });
  const supabase = await createClient();
  const settings = {
    organization_id: context.organization.id, theme,
    gallery_enabled: Boolean(body.gallery_enabled), videos_enabled: Boolean(body.videos_enabled),
    contact_enabled: Boolean(body.contact_enabled), analytics_enabled: Boolean(body.analytics_enabled),
    ai_review_enabled: context.organization.plan === "pro" && Boolean(body.ai_review_enabled),
    updated_at: new Date().toISOString(),
  };
  const [{ error: orgError }, { error: settingsError }] = await Promise.all([
    supabase.from("organizations").update({ name, updated_at: new Date().toISOString() }).eq("id", context.organization.id),
    supabase.from("organization_settings").upsert(settings),
  ]);
  if (orgError || settingsError) return NextResponse.json({ error: "Settings could not be saved." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
