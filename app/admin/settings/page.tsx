import { redirect } from "next/navigation";
import { AdminNav } from "../admin-nav";
import { getOrganizationForUser } from "@/lib/organization";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Site settings" };

export default async function SettingsPage() {
  const context = await getOrganizationForUser();
  if (!context) redirect("/login");
  return <main><div className="admin-shell"><AdminNav /><section>
    <p className="eyebrow">Multi-design · Multi-app</p><h2>Site settings</h2>
    <p className="lede">Choose the public look and the apps shown to visitors. Changes persist for {context.organization.name}.</p>
    <SettingsForm organization={context.organization} settings={context.settings} canEdit={context.role === "owner"} />
  </section></div></main>;
}
