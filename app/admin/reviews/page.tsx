import { redirect } from "next/navigation";
import { AdminNav } from "../admin-nav";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationForUser } from "@/lib/organization";
import { ReviewQueue } from "./review-queue";

export const dynamic = "force-dynamic";
export const metadata = { title: "AI reviews" };

export default async function ReviewsPage() {
  const context = await getOrganizationForUser();
  if (!context) redirect("/login");
  const supabase = await createClient();
  const { data } = await supabase.from("review_tasks").select("id,post_id,kind,status,proposed_value,confidence,created_at,posts(title)").eq("organization_id", context.organization.id).eq("status", "pending").order("created_at", { ascending: false });
  return <main><div className="admin-shell"><AdminNav /><section><p className="eyebrow">Multi-team · AI</p><h2>AI review queue</h2><p className="lede">A human accepts or rejects every proposed summary and tag set before public use.</p>{context.organization.plan === "pro" ? <ReviewQueue initialTasks={data ?? []} /> : <div className="empty">The automated review queue is a Pro feature. Manual AI fields in the post editor remain available.</div>}</section></div></main>;
}
