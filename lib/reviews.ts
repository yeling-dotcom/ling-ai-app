import type { SupabaseClient } from "@supabase/supabase-js";

export async function createReviewTasks(
  supabase: SupabaseClient,
  organizationId: string,
  postId: string,
  intelligence: { ai_summary: string; ai_summary_confidence: number; ai_tags: string[]; ai_tags_confidence: number },
) {
  const { error } = await supabase.from("review_tasks").insert([
    { organization_id: organizationId, post_id: postId, kind: "summary", proposed_value: intelligence.ai_summary, confidence: intelligence.ai_summary_confidence },
    { organization_id: organizationId, post_id: postId, kind: "tags", proposed_value: intelligence.ai_tags, confidence: intelligence.ai_tags_confidence },
  ]);
  if (error) console.error("Review task creation failed", error.code);
}
