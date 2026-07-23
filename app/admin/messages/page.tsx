import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "../admin-nav";
import { MessageInbox } from "./message-inbox";

export const dynamic = "force-dynamic";

export default async function MessagesAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
  return <main><div className="admin-shell"><AdminNav /><section><p className="eyebrow">Inbox</p><h2>Messages</h2><MessageInbox initialMessages={data ?? []} /></section></div></main>;
}
