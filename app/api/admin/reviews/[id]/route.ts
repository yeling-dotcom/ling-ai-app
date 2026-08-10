import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationForUser } from "@/lib/organization";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getOrganizationForUser();
  if (!context) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (context.organization.plan !== "pro") return NextResponse.json({ error: "The review queue requires Pro." }, { status: 403 });
  const body = await request.json();
  const status = body.status === "accepted" ? "accepted" : body.status === "rejected" ? "rejected" : null;
  if (!status) return NextResponse.json({ error: "Review status is invalid." }, { status: 422 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const id = (await params).id;
  const { data: task } = await supabase.from("review_tasks").select("*").eq("id", id).eq("organization_id", context.organization.id).eq("status", "pending").maybeSingle();
  if (!task) return NextResponse.json({ error: "Review task was not found." }, { status: 404 });
  const postUpdate = task.kind === "summary"
    ? { ai_summary: task.proposed_value, ai_summary_review_status: status }
    : { ai_tags: task.proposed_value, ai_tags_review_status: status };
  const [{ error: postError }, { error: taskError }] = await Promise.all([
    supabase.from("posts").update(postUpdate).eq("id", task.post_id).eq("organization_id", context.organization.id),
    supabase.from("review_tasks").update({ status, reviewed_by: user!.id, reviewed_at: new Date().toISOString() }).eq("id", id),
  ]);
  if (postError || taskError) return NextResponse.json({ error: "Review could not be saved." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
