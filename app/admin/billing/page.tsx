import { redirect } from "next/navigation";
import { AdminNav } from "../admin-nav";
import { getOrganizationForUser } from "@/lib/organization";
import { BillingActions } from "./billing-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Billing" };

export default async function BillingPage() {
  const context = await getOrganizationForUser();
  if (!context) redirect("/login");
  const configured = Boolean(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY);
  return <main><div className="admin-shell"><AdminNav /><section><p className="eyebrow">Multi-tier</p><h2>Billing</h2><p className="lede">Current plan: <strong>{context.organization.plan.toUpperCase()}</strong></p><div className="admin-card"><div><h3>Pro</h3><p>Up to 10 members, all themes, and the automated AI review queue.</p></div>{context.role === "owner" ? <BillingActions plan={context.organization.plan} configured={configured} monthlyPrice={process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY ?? ""} hasCustomer={Boolean(context.organization.stripe_customer_id)} /> : <p className="meta">Only the owner can manage billing.</p>}</div></section></div></main>;
}
