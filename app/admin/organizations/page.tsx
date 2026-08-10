import { redirect } from "next/navigation";
import { AdminNav } from "../admin-nav";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationForUser } from "@/lib/organization";
import { OrganizationManager } from "./organization-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Organizations" };

export default async function OrganizationsPage() {
  const current = await getOrganizationForUser();
  if (!current) redirect("/login");
  const supabase = await createClient();
  const { data: memberships } = await supabase.from("organization_members").select("organization_id,role,organizations(id,name,slug,plan)").order("created_at");
  return <main><div className="admin-shell"><AdminNav /><section><p className="eyebrow">Multi-tenant</p><h2>Organizations</h2><p className="lede">Create and switch between isolated publishing workspaces.</p><OrganizationManager memberships={memberships ?? []} activeId={current.organization.id} /></section></div></main>;
}
