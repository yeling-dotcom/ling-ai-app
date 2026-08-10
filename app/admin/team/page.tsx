import { redirect } from "next/navigation";
import { AdminNav } from "../admin-nav";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationForUser, planLimits } from "@/lib/organization";
import { TeamManager } from "./team-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Team" };

export default async function TeamPage() {
  const context = await getOrganizationForUser();
  if (!context) redirect("/login");
  const supabase = await createClient();
  const [{ data: members }, { data: invitations }] = await Promise.all([
    supabase.from("organization_members").select("user_id,role,created_at").eq("organization_id", context.organization.id).order("created_at"),
    supabase.from("organization_invitations").select("id,email,role,token,expires_at,accepted_at").eq("organization_id", context.organization.id).order("created_at", { ascending: false }),
  ]);
  return <main><div className="admin-shell"><AdminNav /><section>
    <p className="eyebrow">Multi-team</p><h2>Team</h2><p className="lede">Invite editors and reviewers. Invitation links work only for the matching signed-in email.</p>
    <TeamManager members={members ?? []} invitations={invitations ?? []} canInvite={context.role === "owner"} memberLimit={planLimits(context.organization.plan).members} appUrl={process.env.NEXT_PUBLIC_APP_URL ?? ""} />
  </section></div></main>;
}
