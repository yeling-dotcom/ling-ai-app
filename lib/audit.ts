import type { SupabaseClient } from "@supabase/supabase-js";

export async function logAudit(
  supabase: SupabaseClient,
  entry: {
    action: string;
    table_name: string;
    organization_id?: string | null;
    row_id?: string | null;
    actor_user_id?: string | null;
    old_value?: unknown;
    new_value?: unknown;
  },
) {
  const { error } = await supabase.from("audit_logs").insert({
    ...entry,
    old_value: entry.old_value ?? null,
    new_value: entry.new_value ?? null,
  });
  if (error) console.error("Audit log write failed", error.code);
}
